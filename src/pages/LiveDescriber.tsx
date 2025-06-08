
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, MicOff, Volume2, VolumeX, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const LiveDescriber = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoDescribe, setAutoDescribe] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        if (transcript.toLowerCase().includes('describe') || transcript.toLowerCase().includes('what do you see')) {
          captureAndDescribe();
        }
      };
    }

    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsStreaming(true);
      
      if (autoDescribe) {
        intervalRef.current = setInterval(() => {
          captureAndDescribe();
        }, 5000); // Describe every 5 seconds
      }
      
      toast({
        title: "Camera Started",
        description: "Live environment describer is now active.",
      });
    } catch (error) {
      console.error('Camera access error:', error);
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
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsStreaming(false);
    setAutoDescribe(false);
    
    toast({
      title: "Camera Stopped",
      description: "Live environment describer has been stopped.",
    });
  };

  const captureAndDescribe = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Simulate AI description (in real implementation, this would call your Python backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDescriptions = [
        "I can see a room with natural lighting coming from the left. There appears to be furniture in the background, possibly a desk or table. The lighting suggests it's daytime.",
        "The environment shows an indoor space with good lighting. I can detect some objects on surfaces, possibly books or papers. The space appears organized and clean.",
        "I observe a well-lit interior space. There are some vertical structures that could be walls or furniture. The overall environment seems safe for navigation.",
        "The scene shows an indoor area with adequate lighting. I can see some horizontal surfaces that might be useful for placing objects. The space appears to be a living or working area.",
        "I detect an indoor environment with natural light. There are some distinct shapes and objects visible, suggesting this is an active living space with furniture and personal items."
      ];
      
      const newDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
      setDescription(newDescription);
      
      // Auto-speak if not already speaking
      if (!isSpeaking) {
        speakDescription(newDescription);
      }
      
    } catch (error) {
      console.error('Description error:', error);
      toast({
        title: "Description Error",
        description: "Failed to generate environment description.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakDescription = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech Not Available",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Voice commands are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening for Commands",
        description: "Say 'describe' or 'what do you see' to get environment description.",
      });
    }
  };

  const toggleAutoDescribe = () => {
    setAutoDescribe(!autoDescribe);
    
    if (!autoDescribe && isStreaming) {
      intervalRef.current = setInterval(() => {
        captureAndDescribe();
      }, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Live Environment Describer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered real-time environment description for visually impaired users. 
            Get spoken descriptions of your surroundings using your camera and voice commands.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Camera Controls */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-purple-600" />
                Camera Controls
              </CardTitle>
              <CardDescription>
                Start your camera to begin live environment description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={isStreaming ? stopCamera : startCamera}
                  variant={isStreaming ? "destructive" : "default"}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {isStreaming ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  {isStreaming ? 'Stop Camera' : 'Start Camera'}
                </Button>

                <Button 
                  onClick={captureAndDescribe}
                  disabled={!isStreaming || isProcessing}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      Describe Now
                    </>
                  )}
                </Button>

                <Button 
                  onClick={toggleAutoDescribe}
                  disabled={!isStreaming}
                  variant={autoDescribe ? "default" : "outline"}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-5 w-5" />
                  Auto Describe {autoDescribe ? 'ON' : 'OFF'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-blue-600" />
                Voice Controls
              </CardTitle>
              <CardDescription>
                Use voice commands and hear descriptions spoken aloud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={toggleListening}
                  variant={isListening ? "default" : "outline"}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  {isListening ? 'Stop Listening' : 'Start Voice Commands'}
                </Button>

                <Button 
                  onClick={() => description ? speakDescription(description) : null}
                  disabled={!description || isSpeaking}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-5 w-5" />
                  Speak Description
                </Button>

                <Button 
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <VolumeX className="h-5 w-5" />
                  Stop Speaking
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Camera Feed */}
          {isStreaming && (
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle>Live Camera Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full max-w-2xl mx-auto">
                  <video 
                    ref={videoRef}
                    className="w-full h-auto rounded-lg shadow-lg"
                    autoPlay
                    muted
                    playsInline
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Analyzing environment...</p>
                      </div>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          )}

          {/* Description Output */}
          {description && (
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-6 w-6 text-orange-600" />
                  Environment Description
                  {isSpeaking && <Loader2 className="h-4 w-4 animate-spin text-orange-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-50 rounded-lg p-6">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-0">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Camera Features:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Click "Start Camera" to begin</li>
                    <li>• Use "Describe Now" for immediate description</li>
                    <li>• Enable "Auto Describe" for continuous updates</li>
                    <li>• Descriptions update every 5 seconds when auto mode is on</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Voice Features:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Enable voice commands to control with speech</li>
                    <li>• Say "describe" or "what do you see" to trigger</li>
                    <li>• All descriptions are automatically spoken aloud</li>
                    <li>• Use stop/start controls for speech as needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveDescriber;
