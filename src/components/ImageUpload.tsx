
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ProcessedFile {
  filename: string;
  original_name: string;
  caption: string;
  tags: string[];
}

interface ImageUploadProps {
  onUploadComplete: (files: ProcessedFile[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onUploadComplete(result.processed_files);
        toast({
          title: "Upload Successful",
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    disabled: uploading
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <>
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-gray-600">Processing images with AI...</p>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop images here' : 'Upload Images'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag & drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports: JPG, PNG, GIF, BMP, WebP
                </p>
              </div>
              
              <Button variant="outline" className="mt-4">
                Select Images
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageUpload;
