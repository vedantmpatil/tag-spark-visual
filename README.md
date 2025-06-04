
# AI Image Tagging & Search Application

A full-stack web application that automatically generates captions and tags for images using AI, and provides intelligent search functionality.

## Features

🔍 **AI-Powered Image Analysis**
- Automatic caption generation using BLIP (Bootstrapped Language-Image Pre-training)
- Intelligent tag extraction using spaCy NLP
- Support for multiple image formats (JPG, PNG, GIF, BMP, WebP)

🎯 **Smart Search**
- Natural language search queries
- Relevance scoring for search results
- Tag-based and caption-based matching

💾 **Simple Storage**
- JSON-based data storage (no database required)
- Local file system for image storage
- Portable and easy to backup

🎨 **Modern UI**
- Responsive React frontend with Tailwind CSS
- Drag & drop image upload
- Real-time search with smooth animations
- Mobile-friendly design

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- React Dropzone for file uploads

**Backend:**
- Python Flask web server
- Transformers library (BLIP model)
- spaCy for natural language processing
- PIL for image processing

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies and download models:
```bash
python setup.py
```

3. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## Usage

### Upload Images
1. Go to the "Upload Images" tab
2. Drag & drop images or click to select files
3. Wait for AI processing to complete
4. View generated captions and tags

### Search Images
1. Go to the "Search Images" tab  
2. Enter natural language queries like:
   - "brown dog"
   - "sunset beach"
   - "red car"
   - "person with glasses"
3. View search results sorted by relevance

## API Endpoints

- `POST /upload` - Upload and process images
- `POST /search` - Search images by text query
- `GET /images/<filename>` - Serve image files
- `GET /status` - Get system status

## Data Storage

Images and metadata are stored locally:
- `backend/uploads/` - Uploaded image files
- `backend/image_data.json` - Image metadata and tags

## Model Information

**BLIP Model:** `Salesforce/blip-image-captioning-base`
- Generates descriptive captions for images
- Handles diverse image content and scenes

**spaCy Model:** `en_core_web_sm`
- Extracts meaningful nouns and adjectives
- Identifies compound concepts and phrases

## Troubleshooting

**Backend not starting:**
- Ensure Python 3.7+ is installed
- Run `python setup.py` to install dependencies
- Check that all models downloaded successfully

**Search not working:**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure images have been uploaded first

**Upload failing:**
- Check file formats are supported
- Verify backend has write permissions to uploads folder
- Monitor backend logs for processing errors

## Contributing

Feel free to submit issues and enhancement requests!
