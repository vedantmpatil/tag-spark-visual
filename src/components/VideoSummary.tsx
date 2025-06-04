
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Video, Loader, Copy, Play, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RealTimeCamera from './RealTimeCamera';

interface VideoResult {
  original_filename: string;
  frames_processed: number;
  captions: string[];
  summary: string;
  total_scenes: number;
}

const VideoSummary: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');

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
        setProgress(prev => Math.min(prev + 8, 90));
      }, 800);

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
        description: `Video processed successfully! Generated intelligent summary from ${videoResult.total_scenes} scenes.`,
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
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
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
          Video AI Suite
        </h1>
        <p className="text-lg text-gray-600">
          Upload videos for intelligent scene analysis or use real-time camera for live assistance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Video Upload
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Live Camera
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
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
                    <p className="text-gray-600">Processing video with AI...</p>
                    <p className="text-sm text-gray-500">
                      Extracting scenes, generating captions, and creating summary
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
                        {isDragActive ? 'Drop video here' : 'Upload Video for AI Analysis'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag & drop a video file here, or click to select
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports: MP4, AVI, MOV, MKV, WebM (max 100MB recommended)
                      </p>
                    </div>
                    
                    <Button variant="outline" className="mt-4">
                      <Play className="w-4 h-4 mr-2" />
                      Select Video
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {result && (
            <div className="space-y-6">
              <Card className="p-6 border-green-200 bg-green-50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">AI Video Summary</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-white">
                        {result.frames_processed} key frames
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        {result.total_scenes} scenes
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="bg-white"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-gray-800 leading-relaxed">{result.summary}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>File: {result.original_filename}</span>
                    <span>•</span>
                    <span>Scenes: {result.total_scenes}</span>
                    <span>•</span>
                    <span>Key Frames: {result.frames_processed}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Scene-by-Scene Analysis
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.captions.map((caption, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">{caption}</p>
                    </div>
                  ))}
                  {result.total_scenes > result.captions.length && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ... and {result.total_scenes - result.captions.length} more scenes analyzed
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-2">🎥 Enhanced Video Processing:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Advanced scene detection using intelligent frame analysis</li>
                <li>• Detailed AI-generated captions for each key scene</li>
                <li>• Comprehensive summary with context and relationships</li>
                <li>• Optimized for accessibility and content understanding</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <RealTimeCamera />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoSummary;
