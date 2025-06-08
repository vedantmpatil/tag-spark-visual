
import React, { useState, useRef } from 'react';
import { pipeline } from '@huggingface/transformers';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Volume2, VolumeX } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

let summarizer: any = null;

const TextSummarizer = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadModel = async () => {
    if (summarizer) return summarizer;
    
    setIsLoadingModel(true);
    try {
      summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
        device: 'webgpu',
        dtype: 'q8',
      });
      setIsLoadingModel(false);
      return summarizer;
    } catch (error) {
      setIsLoadingModel(false);
      toast({
        title: "Model Loading Error",
        description: "Failed to load the summarization model. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    if (inputText.length < 100) {
      toast({
        title: "Text Too Short",
        description: "Please enter at least 100 characters for meaningful summarization.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const model = await loadModel();
      const result = await model(inputText, {
        max_length: 150,
        min_length: 30,
        do_sample: false,
      });
      
      setSummary(result[0].summary_text);
      toast({
        title: "Success",
        description: "Text has been summarized successfully!",
      });
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: "Summarization Error",
        description: "Failed to summarize the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "Summary has been copied to clipboard.",
    });
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!summary) {
      toast({
        title: "No Text to Read",
        description: "Please generate a summary first.",
        variant: "destructive",
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Text Summarizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform long text into concise summaries using advanced AI. 
            Paste your content below and get an intelligent summary in seconds.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>
                Paste or type the text you want to summarize (minimum 100 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your long text here..."
                className="min-h-[200px] resize-none"
                disabled={isLoading || isLoadingModel}
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {inputText.length} characters
                </span>
                <Button 
                  onClick={handleSummarize}
                  disabled={isLoading || isLoadingModel || !inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingModel ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Model...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    'Summarize Text'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  AI-generated summary of your text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 leading-relaxed">{summary}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleSpeak}
                    variant="outline"
                    size="sm"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="mr-2 h-4 w-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Read Aloud
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextSummarizer;
