
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Volume2, VolumeX, Eye, Pause, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import io from 'socket.io-client';

const RealTimeCamera: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentDescription, setCurrentDescription] = useState('Camera not active');
  const [isConnected, setIsConnected] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to camera processing server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketRef.current.on('frame_description', (data: any) => {
      setCurrentDescription(data.description);
      
      // Speak the description if speech is enabled
      if (speechEnabled && !isPaused && data.description !== currentDescription) {
        speakDescription(data.description);
      }
    });

    socketRef.current.on('camera_status', (data: any) => {
      console.log('Camera status:', data.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopCamera();
    };
  }, []);

  const speakDescription = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera on mobile
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsActive(true);
      socketRef.current?.emit('start_camera');
      
      // Start processing frames
      startFrameProcessing();

      toast({
        title: "Camera Started",
        description: "Real-time visual assistance is now active",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setCurrentDescription('Camera not active');
    socketRef.current?.emit('stop_camera');

    // Stop speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    toast({
      title: "Camera Stopped",
      description: "Visual assistance has been turned off",
    });
  };

  const startFrameProcessing = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    const processFrame = () => {
      if (!isActive || isPaused) return;

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx?.drawImage(video, 0, 0);
        
        // Convert to base64 and send to server
        const frameData = canvas.toDataURL('image/jpeg', 0.8);
        socketRef.current?.emit('process_frame', { frame: frameData });
      }

      // Process every 2 seconds to avoid overwhelming the server
      setTimeout(processFrame, 2000);
    };

    // Start processing after a short delay
    setTimeout(processFrame, 1000);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startFrameProcessing();
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (!speechEnabled) {
      // Stop current speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Eye className="w-8 h-8 text-blue-600" />
          Real-Time Visual Assistant
        </h1>
        <p className="text-lg text-gray-600">
          Live camera feed with AI-powered descriptions for visually impaired users
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex justify-center">
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Server Connected" : "Server Disconnected"}
        </Badge>
      </div>

      {/* Camera Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <Button 
                onClick={startCamera} 
                disabled={!isConnected}
                className="flex items-center gap-2"
                size="lg"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={togglePause}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                
                <Button 
                  onClick={toggleSpeech}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {speechEnabled ? 'Mute' : 'Unmute'}
                </Button>
                
                <Button 
                  onClick={stopCamera}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <CameraOff className="w-4 h-4" />
                  Stop Camera
                </Button>
              </div>
            )}
          </div>

          {/* Video Feed */}
          {isActive && (
            <div className="flex justify-center">
              <div className="relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="rounded-lg max-w-full h-auto border-2 border-gray-300"
                  style={{ maxHeight: '400px' }}
                />
                {isPaused && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-lg font-medium">Paused</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden canvas for frame processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </Card>

      {/* Live Description */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Live Description</h3>
            <div className="flex items-center space-x-2">
              {isActive && !isPaused && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live
                </Badge>
              )}
              <Badge variant={speechEnabled ? "default" : "secondary"}>
                {speechEnabled ? "Audio On" : "Audio Off"}
              </Badge>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-gray-800 leading-relaxed">{currentDescription}</p>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="text-sm text-amber-800">
          <h4 className="font-medium mb-2">🔊 Instructions for Visual Assistance:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Click "Start Camera" to begin real-time visual descriptions</li>
            <li>• Descriptions are automatically spoken aloud for accessibility</li>
            <li>• Use "Pause" to temporarily stop processing without turning off camera</li>
            <li>• Toggle audio on/off with the volume button</li>
            <li>• Point camera at objects, people, or environments for detailed descriptions</li>
            <li>• The system detects safety elements like stairs, doors, and obstacles</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default RealTimeCamera;
