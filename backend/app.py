
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
import spacy
import re
from collections import Counter

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
DATA_FILE = 'image_data.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize AI models
print("Loading BLIP model...")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

print("Loading spaCy model...")
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model not found. Please install with: python -m spacy download en_core_web_sm")
    nlp = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            'spacy': nlp is not None
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
