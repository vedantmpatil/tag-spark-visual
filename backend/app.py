
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration, BartTokenizer, BartForConditionalGeneration
import spacy
import re
import cv2
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import Counter
import threading
import time
import base64

app = Flask(__name__)
CORS(app, origins=["*"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
UPLOAD_FOLDER = 'uploads'
VIDEO_FOLDER = 'videos'
DATA_FILE = 'image_data.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# Ensure upload directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VIDEO_FOLDER, exist_ok=True)

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

# Initialize AI models
print("Loading BLIP model...")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

print("Loading BART model for better summarization...")
bart_tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
bart_model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")

print("Loading sentence transformer for semantic similarity...")
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

print("Loading spaCy model...")
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model not found. Please install with: python -m spacy download en_core_web_sm")
    nlp = None

# Global variables for real-time processing
current_camera_description = "Camera not active"
camera_active = False

def allowed_file(filename, extensions=ALLOWED_EXTENSIONS):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in extensions

def load_image_data():
    """Load existing image data from JSON file."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}

def save_image_data(data):
    """Save image data to JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def generate_detailed_caption(image_path_or_array):
    """Generate detailed caption for an image using BLIP."""
    try:
        if isinstance(image_path_or_array, str):
            image = Image.open(image_path_or_array).convert('RGB')
        else:
            # Handle numpy array from camera
            image = Image.fromarray(cv2.cvtColor(image_path_or_array, cv2.COLOR_BGR2RGB))
        
        # Generate multiple captions with different prompts for better coverage
        captions = []
        
        # General caption
        inputs = blip_processor(image, return_tensors="pt")
        with torch.no_grad():
            out = blip_model.generate(**inputs, max_length=100, num_beams=5, length_penalty=0.8)
        general_caption = blip_processor.decode(out[0], skip_special_tokens=True)
        captions.append(general_caption)
        
        # Detailed description
        inputs = blip_processor(image, "describe this image in detail", return_tensors="pt")
        with torch.no_grad():
            out = blip_model.generate(**inputs, max_length=100, num_beams=5, length_penalty=0.8)
        detailed_caption = blip_processor.decode(out[0], skip_special_tokens=True)
        captions.append(detailed_caption)
        
        # Objects and environment
        inputs = blip_processor(image, "what objects and environment are visible", return_tensors="pt")
        with torch.no_grad():
            out = blip_model.generate(**inputs, max_length=100, num_beams=5, length_penalty=0.8)
        objects_caption = blip_processor.decode(out[0], skip_special_tokens=True)
        captions.append(objects_caption)
        
        # Combine captions for comprehensive description
        combined_caption = ". ".join(captions)
        return combined_caption
        
    except Exception as e:
        print(f"Error generating caption: {e}")
        return "Unable to generate detailed description"

def extract_tags(caption):
    """Extract meaningful tags from caption using spaCy."""
    if not nlp:
        # Fallback: simple word extraction
        words = re.findall(r'\b[a-zA-Z]+\b', caption.lower())
        return [word for word in words if len(word) > 2 and word not in ['the', 'and', 'with', 'this', 'that']]
    
    doc = nlp(caption)
    tags = []
    
    # Extract nouns, adjectives, and entities
    for token in doc:
        if token.pos_ in ['NOUN', 'ADJ'] and len(token.text) > 2 and not token.is_stop:
            tags.append(token.lemma_.lower())
    
    # Extract named entities
    for ent in doc.ents:
        if ent.label_ in ['PERSON', 'ORG', 'GPE', 'PRODUCT']:
            tags.append(ent.text.lower())
    
    # Extract noun chunks for compound concepts
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 3:  # Only short phrases
            clean_chunk = re.sub(r'\b(a|an|the)\b', '', chunk.text.lower()).strip()
            if clean_chunk and len(clean_chunk) > 3:
                tags.append(clean_chunk)
    
    # Remove duplicates and common stop words
    stop_words = {'image', 'picture', 'photo', 'view', 'scene', 'show', 'display'}
    tags = list(set([tag for tag in tags if tag not in stop_words]))
    
    return tags[:15]  # Limit to 15 most relevant tags

def advanced_text_deduplication(sentences, threshold=0.7):
    """Advanced deduplication using sentence transformers."""
    if len(sentences) <= 1:
        return sentences
    
    try:
        # Get embeddings for all sentences
        embeddings = sentence_model.encode(sentences)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(embeddings)
        
        # Keep track of which sentences to keep
        to_keep = [True] * len(sentences)
        
        for i in range(len(sentences)):
            if not to_keep[i]:
                continue
            for j in range(i + 1, len(sentences)):
                if similarity_matrix[i][j] > threshold:
                    # Keep the longer, more informative sentence
                    if len(sentences[i]) >= len(sentences[j]):
                        to_keep[j] = False
                    else:
                        to_keep[i] = False
                        break
        
        return [sentences[i] for i in range(len(sentences)) if to_keep[i]]
    except:
        # Fallback to simple deduplication
        return list(dict.fromkeys(sentences))

def enhance_text_for_summarization(text):
    """Enhance text quality before summarization."""
    # Split into sentences
    sentences = sent_tokenize(text)
    
    # Remove very short sentences (less than 5 words)
    sentences = [s for s in sentences if len(s.split()) >= 5]
    
    # Remove duplicate sentences
    unique_sentences = advanced_text_deduplication(sentences)
    
    # Sort by informativeness (longer sentences with more nouns/verbs first)
    def sentence_score(sentence):
        words = word_tokenize(sentence.lower())
        if not nlp:
            return len(words)
        
        doc = nlp(sentence)
        important_pos = sum(1 for token in doc if token.pos_ in ['NOUN', 'VERB', 'ADJ'])
        return important_pos * len(words)
    
    unique_sentences.sort(key=sentence_score, reverse=True)
    
    # Reconstruct text
    enhanced_text = '. '.join(unique_sentences[:20])  # Limit to top 20 sentences
    return enhanced_text

def generate_meaningful_summary(text):
    """Generate meaningful summary using BART model."""
    try:
        # Enhance text quality
        enhanced_text = enhance_text_for_summarization(text)
        
        if len(enhanced_text.split()) < 10:
            return "Text too short to generate meaningful summary."
        
        # Prepare input for BART
        inputs = bart_tokenizer.encode(
            enhanced_text, 
            return_tensors="pt", 
            max_length=1024, 
            truncation=True
        )
        
        # Generate summary with optimized parameters
        with torch.no_grad():
            summary_ids = bart_model.generate(
                inputs,
                max_length=200,
                min_length=50,
                length_penalty=2.0,
                num_beams=6,
                early_stopping=True,
                no_repeat_ngram_size=3,
                temperature=0.7
            )
        
        summary = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        # Post-process summary
        summary = summary.strip()
        if not summary.endswith('.'):
            summary += '.'
            
        return summary
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        return "Unable to generate meaningful summary. Please try with different text."

def process_camera_frame(frame_data):
    """Process camera frame for real-time description."""
    try:
        # Decode base64 image
        image_data = base64.b64decode(frame_data.split(',')[1])
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Generate detailed caption
        description = generate_detailed_caption(frame)
        
        # Make it more accessible for visually impaired
        accessible_description = make_accessible_description(description)
        
        return accessible_description
    except Exception as e:
        print(f"Error processing camera frame: {e}")
        return "Unable to process camera feed"

def make_accessible_description(description):
    """Convert description to be more accessible for visually impaired users."""
    try:
        # Add context and spatial information
        enhanced_description = f"Visual description: {description}"
        
        # Extract key objects and their positions/relationships
        if nlp:
            doc = nlp(description)
            objects = [ent.text for ent in doc.ents if ent.label_ in ['PERSON', 'ORG', 'PRODUCT']]
            
            if objects:
                enhanced_description += f" Key elements detected: {', '.join(objects[:3])}."
        
        # Add safety and navigation hints if needed
        safety_keywords = ['stairs', 'door', 'obstacle', 'vehicle', 'traffic', 'crossing']
        for keyword in safety_keywords:
            if keyword in description.lower():
                enhanced_description += f" Notice: {keyword} detected in view."
                
        return enhanced_description
    except:
        return description

# ... keep existing code (upload and search endpoints)

@app.route('/upload', methods=['POST'])
def upload_images():
    """Handle image upload and processing."""
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    if not files or all(file.filename == '' for file in files):
        return jsonify({'error': 'No files selected'}), 400
    
    processed_files = []
    image_data = load_image_data()
    
    for file in files:
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            try:
                file.save(filepath)
                
                # Generate detailed caption
                caption = generate_detailed_caption(filepath)
                
                # Extract tags
                tags = extract_tags(caption)
                
                # Store in data structure
                image_data[filename] = {
                    'tags': tags,
                    'caption': caption,
                    'original_name': file.filename
                }
                
                processed_files.append({
                    'filename': filename,
                    'original_name': file.filename,
                    'caption': caption,
                    'tags': tags
                })
                
            except Exception as e:
                print(f"Error processing {file.filename}: {e}")
                continue
    
    # Save updated data
    save_image_data(image_data)
    
    return jsonify({
        'success': True,
        'processed_files': processed_files,
        'message': f'Successfully processed {len(processed_files)} images'
    })

@app.route('/search', methods=['POST'])
def search_images():
    """Search images by text query."""
    data = request.get_json()
    query = data.get('query', '').strip().lower()
    
    if not query:
        return jsonify({'error': 'Query cannot be empty'}), 400
    
    image_data = load_image_data()
    
    if not image_data:
        return jsonify({'results': [], 'message': 'No images in database'})
    
    # Tokenize query
    query_tokens = re.findall(r'\b[a-zA-Z]+\b', query)
    
    results = []
    
    for filename, data in image_data.items():
        tags = data.get('tags', [])
        caption = data.get('caption', '')
        
        # Check for matches in tags and caption
        matched_tags = []
        score = 0
        
        for token in query_tokens:
            # Direct tag matches (higher weight)
            for tag in tags:
                if token in tag or tag in token:
                    matched_tags.append(tag)
                    score += 2
            
            # Caption matches (lower weight)
            if token in caption.lower():
                score += 1
        
        if matched_tags or score > 0:
            results.append({
                'filename': filename,
                'original_name': data.get('original_name', filename),
                'matched_tags': list(set(matched_tags)),
                'caption': caption,
                'score': score
            })
    
    # Sort by relevance score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify({
        'results': results,
        'query': query,
        'total_matches': len(results)
    })

@app.route('/summarize', methods=['POST'])
def summarize_text_endpoint():
    """Enhanced text summarization endpoint."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        if len(text.split()) < 10:
            return jsonify({'error': 'Text too short to summarize (minimum 10 words)'}), 400
        
        summary = generate_meaningful_summary(text)
        
        return jsonify({
            'success': True,
            'original_text': text,
            'summary': summary,
            'original_length': len(text),
            'summary_length': len(summary),
            'compression_ratio': round(len(summary) / len(text) * 100, 1)
        })
        
    except Exception as e:
        print(f"Error in text summarization: {e}")
        return jsonify({'error': 'Failed to process text'}), 500

@app.route('/video-summary', methods=['POST'])
def process_video():
    """Enhanced video processing for comprehensive summaries."""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'error': 'No video selected'}), 400
        
        if not allowed_file(video_file.filename, ALLOWED_VIDEO_EXTENSIONS):
            return jsonify({'error': 'Invalid video format'}), 400
        
        # Save video file
        filename = str(uuid.uuid4()) + '.' + video_file.filename.rsplit('.', 1)[1].lower()
        video_path = os.path.join(VIDEO_FOLDER, filename)
        video_file.save(video_path)
        
        # Extract key frames with better algorithm
        frames = extract_intelligent_frames(video_path)
        
        if not frames:
            return jsonify({'error': 'Unable to extract meaningful frames from video'}), 400
        
        # Generate captions for frames
        captions = []
        for frame_num, frame in frames:
            try:
                caption = generate_detailed_caption(frame)
                captions.append(f"Scene {frame_num}: {caption}")
            except Exception as e:
                print(f"Error processing frame {frame_num}: {e}")
                continue
        
        if not captions:
            return jsonify({'error': 'Unable to generate captions'}), 400
        
        # Combine captions and summarize
        combined_text = ' '.join(captions)
        summary = generate_meaningful_summary(combined_text)
        
        # Clean up video file
        try:
            os.remove(video_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'original_filename': video_file.filename,
            'frames_processed': len(frames),
            'captions': captions[:10],  # Limit display
            'summary': summary,
            'total_scenes': len(captions)
        })
        
    except Exception as e:
        print(f"Error processing video: {e}")
        return jsonify({'error': 'Failed to process video'}), 500

def extract_intelligent_frames(video_path, threshold=25.0, max_frames=20):
    """Extract key frames using improved algorithm."""
    try:
        cap = cv2.VideoCapture(video_path)
        frames = []
        prev_frame = None
        frame_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_interval = max(1, total_frames // max_frames)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Only process every nth frame for efficiency
            if frame_count % frame_interval == 0:
                # Resize for faster processing
                small_frame = cv2.resize(frame, (320, 240))
                gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)
                
                if prev_frame is not None:
                    # Calculate frame difference using histogram comparison
                    hist1 = cv2.calcHist([prev_frame], [0], None, [256], [0, 256])
                    hist2 = cv2.calcHist([gray], [0], None, [256], [0, 256])
                    diff_score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
                    
                    # If significant change (lower correlation = more change)
                    if diff_score < 0.95:  # Threshold for scene change
                        frames.append((frame_count, frame))
                else:
                    # Always include first frame
                    frames.append((frame_count, frame))
                
                prev_frame = gray
            
            frame_count += 1
            
            if len(frames) >= max_frames:
                break
        
        cap.release()
        return frames
    except Exception as e:
        print(f"Error extracting frames: {e}")
        return []

# Real-time camera processing endpoints
@socketio.on('start_camera')
def handle_start_camera():
    """Start real-time camera processing."""
    global camera_active
    camera_active = True
    emit('camera_status', {'active': True, 'message': 'Camera processing started'})

@socketio.on('stop_camera')
def handle_stop_camera():
    """Stop real-time camera processing."""
    global camera_active
    camera_active = False
    emit('camera_status', {'active': False, 'message': 'Camera processing stopped'})

@socketio.on('process_frame')
def handle_process_frame(data):
    """Process incoming camera frame."""
    if not camera_active:
        return
    
    try:
        frame_data = data.get('frame')
        if frame_data:
            description = process_camera_frame(frame_data)
            emit('frame_description', {
                'description': description,
                'timestamp': time.time()
            })
    except Exception as e:
        emit('frame_description', {
            'description': f"Error processing frame: {str(e)}",
            'timestamp': time.time()
        })

@app.route('/images/<filename>')
def serve_image(filename):
    """Serve uploaded images."""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/status')
def status():
    """Get application status."""
    image_data = load_image_data()
    return jsonify({
        'status': 'running',
        'total_images': len(image_data),
        'models_loaded': {
            'blip': blip_model is not None,
            'spacy': nlp is not None,
            'bart': bart_model is not None,
            'sentence_transformer': sentence_model is not None
        },
        'camera_active': camera_active
    })

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
