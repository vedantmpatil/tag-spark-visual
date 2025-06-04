
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration, T5Tokenizer, T5ForConditionalGeneration
import spacy
import re
import cv2
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
VIDEO_FOLDER = 'videos'
DATA_FILE = 'image_data.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# Ensure upload directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VIDEO_FOLDER, exist_ok=True)

# Initialize AI models
print("Loading BLIP model...")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

print("Loading T5 model...")
t5_tokenizer = T5Tokenizer.from_pretrained("t5-small")
t5_model = T5ForConditionalGeneration.from_pretrained("t5-small")

print("Loading spaCy model...")
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model not found. Please install with: python -m spacy download en_core_web_sm")
    nlp = None

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

def generate_caption(image_path):
    """Generate caption for an image using BLIP."""
    try:
        image = Image.open(image_path).convert('RGB')
        inputs = blip_processor(image, return_tensors="pt")
        
        with torch.no_grad():
            out = blip_model.generate(**inputs, max_length=50, num_beams=5)
        
        caption = blip_processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        print(f"Error generating caption: {e}")
        return "Unable to generate caption"

def extract_tags(caption):
    """Extract meaningful tags from caption using spaCy."""
    if not nlp:
        # Fallback: simple word extraction
        words = re.findall(r'\b[a-zA-Z]+\b', caption.lower())
        return [word for word in words if len(word) > 2 and word not in ['the', 'and', 'with', 'this', 'that']]
    
    doc = nlp(caption)
    tags = []
    
    # Extract nouns and adjectives
    for token in doc:
        if token.pos_ in ['NOUN', 'ADJ'] and len(token.text) > 2:
            tags.append(token.lemma_.lower())
    
    # Extract noun chunks for compound concepts
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 2:  # Only short phrases
            clean_chunk = re.sub(r'\b(a|an|the)\b', '', chunk.text.lower()).strip()
            if clean_chunk:
                tags.append(clean_chunk)
    
    # Remove duplicates and common stop words
    stop_words = {'image', 'picture', 'photo', 'view', 'scene'}
    tags = list(set([tag for tag in tags if tag not in stop_words]))
    
    return tags[:10]  # Limit to 10 most relevant tags

def deduplicate_text(sentences, threshold=0.8):
    """Remove near-duplicate sentences using TF-IDF similarity."""
    if len(sentences) <= 1:
        return sentences
    
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    try:
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(tfidf_matrix)
        
        # Keep only sentences that are not too similar to previous ones
        unique_sentences = [sentences[0]]  # Always keep the first sentence
        
        for i in range(1, len(sentences)):
            is_duplicate = False
            for j in range(i):
                if similarity_matrix[i][j] > threshold:
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_sentences.append(sentences[i])
        
        return unique_sentences
    except:
        # Fallback: return original sentences if TF-IDF fails
        return sentences

def summarize_text(text):
    """Summarize text using T5 model."""
    try:
        # Split into sentences for deduplication
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Deduplicate similar sentences
        unique_sentences = deduplicate_text(sentences)
        
        # Reconstruct text
        deduplicated_text = '. '.join(unique_sentences) + '.'
        
        # Prepare input for T5
        input_text = f"summarize: {deduplicated_text}"
        
        # Tokenize
        inputs = t5_tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)
        
        # Generate summary
        with torch.no_grad():
            summary_ids = t5_model.generate(
                inputs,
                max_length=150,
                min_length=30,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )
        
        summary = t5_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    except Exception as e:
        print(f"Error summarizing text: {e}")
        return "Unable to generate summary"

def extract_key_frames(video_path, threshold=30.0):
    """Extract key frames from video based on visual change."""
    try:
        cap = cv2.VideoCapture(video_path)
        frames = []
        prev_frame = None
        frame_count = 0
        
        while cap.read()[0]:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert to grayscale for comparison
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if prev_frame is not None:
                # Calculate frame difference
                diff = cv2.absdiff(prev_frame, gray)
                diff_score = np.mean(diff)
                
                # If significant change, save this frame
                if diff_score > threshold:
                    frames.append((frame_count, frame))
            else:
                # Always include first frame
                frames.append((frame_count, frame))
            
            prev_frame = gray
            frame_count += 1
        
        cap.release()
        return frames
    except Exception as e:
        print(f"Error extracting frames: {e}")
        return []

def process_video_frames(frames):
    """Generate captions for video frames."""
    captions = []
    
    for frame_num, frame in frames:
        try:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            
            # Generate caption
            inputs = blip_processor(pil_image, return_tensors="pt")
            with torch.no_grad():
                out = blip_model.generate(**inputs, max_length=50, num_beams=5)
            
            caption = blip_processor.decode(out[0], skip_special_tokens=True)
            captions.append(f"Frame {frame_num}: {caption}")
        except Exception as e:
            print(f"Error processing frame {frame_num}: {e}")
            continue
    
    return captions

# Existing endpoints (keep as-is)
@app.route('/upload', methods=['POST'])
def upload_images():
    """Handle image upload and processing."""
    # ... keep existing code (image upload logic)
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
                
                # Generate caption
                caption = generate_caption(filepath)
                
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
    # ... keep existing code (search logic)
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

# NEW ENDPOINTS

@app.route('/summarize', methods=['POST'])
def summarize_text_endpoint():
    """Summarize text using T5 model with deduplication."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        if len(text) < 50:
            return jsonify({'error': 'Text too short to summarize (minimum 50 characters)'}), 400
        
        summary = summarize_text(text)
        
        return jsonify({
            'success': True,
            'original_text': text,
            'summary': summary,
            'original_length': len(text),
            'summary_length': len(summary)
        })
        
    except Exception as e:
        print(f"Error in text summarization: {e}")
        return jsonify({'error': 'Failed to process text'}), 500

@app.route('/video-summary', methods=['POST'])
def process_video():
    """Process video to generate caption summary."""
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
        
        # Extract key frames
        frames = extract_key_frames(video_path)
        
        if not frames:
            return jsonify({'error': 'Unable to extract frames from video'}), 400
        
        # Generate captions for frames
        captions = process_video_frames(frames)
        
        if not captions:
            return jsonify({'error': 'Unable to generate captions'}), 400
        
        # Combine captions and summarize
        combined_text = ' '.join(captions)
        summary = summarize_text(combined_text)
        
        # Clean up video file
        try:
            os.remove(video_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'original_filename': video_file.filename,
            'frames_processed': len(frames),
            'captions': captions,
            'summary': summary
        })
        
    except Exception as e:
        print(f"Error processing video: {e}")
        return jsonify({'error': 'Failed to process video'}), 500

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
            't5': t5_model is not None
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
