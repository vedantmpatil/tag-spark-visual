
#!/usr/bin/env python3
"""
Setup script for the AI Content Suite backend.
Run this to install dependencies and download required models.
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a command and handle errors."""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("Setting up AI Content Suite Backend...")
    print("=" * 50)
    
    # Install Python requirements
    print("\n1. Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt"):
        print("Failed to install Python dependencies")
        return False
    
    # Download spaCy model
    print("\n2. Downloading spaCy English model...")
    if not run_command("python -m spacy download en_core_web_sm"):
        print("Failed to download spaCy model")
        return False
    
    # Create necessary directories
    print("\n3. Creating directories...")
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("videos", exist_ok=True)
    print("✓ Created uploads directory")
    print("✓ Created videos directory")
    
    print("\n" + "=" * 50)
    print("Setup complete! You can now run the backend with:")
    print("python app.py")
    print("\nAvailable features:")
    print("- Image tagging and search")
    print("- Text summarization")
    print("- Video caption and summary")
    
if __name__ == "__main__":
    main()
