
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader, Copy, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TextSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    originalLength: number;
    summaryLength: number;
  } | null>(null);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize",
        variant: "destructive",
      });
      return;
    }

    if (inputText.trim().length < 50) {
      toast({
        title: "Error",
        description: "Text must be at least 50 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSummary('');
    setStats(null);

    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Summarization failed');
      }

      const result = await response.json();
      setSummary(result.summary);
      setStats({
        originalLength: result.original_length,
        summaryLength: result.summary_length,
      });

      toast({
        title: "Success",
        description: "Text summarized successfully!",
      });
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to summarize text',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Text Summarizer
        </h1>
        <p className="text-lg text-gray-600">
          Paste long text or multiple captions to get a concise, deduplicated summary
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <Textarea
              id="input-text"
              placeholder="Paste your text here... (minimum 50 characters)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px]"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {inputText.length} characters
              </span>
              {inputText.length >= 50 && (
                <Badge variant="secondary">Ready to summarize</Badge>
              )}
            </div>
          </div>

          <Button 
            onClick={handleSummarize} 
            disabled={loading || inputText.trim().length < 50}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Summarize Text
              </>
            )}
          </Button>
        </div>
      </Card>

      {summary && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              <div className="flex items-center space-x-2">
                {stats && (
                  <Badge variant="outline">
                    {Math.round((stats.summaryLength / stats.originalLength) * 100)}% compression
                  </Badge>
                )}
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
              <p className="text-gray-800 leading-relaxed">{summary}</p>
            </div>

            {stats && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Original: {stats.originalLength} characters</span>
                <span>•</span>
                <span>Summary: {stats.summaryLength} characters</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TextSummarizer;
