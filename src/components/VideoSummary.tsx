
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Video, Loader, Copy, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoResult {
  original_filename: string;
  frames_processed: number;
  captions: string[];
  summary: string;
}

const VideoSummary: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const videoFile = acceptedFiles[0];
    
    setProcessing(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const response = await fetch('http://localhost:5000/video-summary', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Video processing failed');
      }

      const videoResult = await response.json();
      setResult(videoResult);

      toast({
        title: "Success",
        description: `Video processed successfully! Generated summary from ${videoResult.frames_processed} key frames.`,
      });
    } catch (error) {
      console.error('Video processing error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process video',
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv']
    },
    multiple: false,
    disabled: processing
  });

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.summary);
      toast({
        title: "Copied",
        description: "Summary copied to clipboard",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Video Caption & Summary
        </h1>
        <p className="text-lg text-gray-600">
          Upload a video to extract key frames, generate captions, and create a summary
        </p>
      </div>

      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${processing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {processing ? (
              <>
                <Loader className="w-12 h-12 text-blue-500 animate-spin" />
                <div className="w-full max-w-xs">
                  <Progress value={progress} className="h-2" />
                </div>
                <p className="text-gray-600">Processing video...</p>
                <p className="text-sm text-gray-500">
                  Extracting frames and generating captions
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <Video className="w-8 h-8 text-gray-400" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isDragActive ? 'Drop video here' : 'Upload Video'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag & drop a video file here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports: MP4, AVI, MOV, MKV
                  </p>
                </div>
                
                <Button variant="outline" className="mt-4">
                  Select Video
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Video Summary</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {result.frames_processed} frames processed
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{result.summary}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>File: {result.original_filename}</span>
                <span>•</span>
                <span>Frames: {result.frames_processed}</span>
                <span>•</span>
                <span>Captions: {result.captions.length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Captions
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {result.captions.map((caption, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{caption}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoSummary;
