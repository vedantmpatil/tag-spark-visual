
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader, Copy, FileText, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TextSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    originalLength: number;
    summaryLength: number;
    compressionRatio: number;
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

    if (inputText.trim().split(' ').length < 10) {
      toast({
        title: "Error",
        description: "Text must be at least 10 words long for meaningful summarization",
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
        compressionRatio: result.compression_ratio,
      });

      toast({
        title: "Success",
        description: `Text summarized successfully! ${result.compression_ratio}% compression achieved.`,
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

  const handleClear = () => {
    setInputText('');
    setSummary('');
    setStats(null);
  };

  const sampleTexts = [
    "Paste your long article, research paper, or multiple captions here...",
    "Try pasting meeting notes, blog posts, or interview transcripts...",
    "You can also paste multiple image captions to get a unified summary..."
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          AI Text Summarizer
        </h1>
        <p className="text-lg text-gray-600">
          Get meaningful, intelligent summaries using advanced AI. Perfect for long articles, research papers, and document analysis.
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
              placeholder={sampleTexts[Math.floor(Math.random() * sampleTexts.length)]}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[250px] text-sm leading-relaxed"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{inputText.length} characters</span>
                <span>•</span>
                <span>{inputText.split(' ').filter(w => w.length > 0).length} words</span>
              </div>
              {inputText.split(' ').filter(w => w.length > 0).length >= 10 && (
                <Badge variant="secondary" className="text-xs">
                  Ready for AI processing
                </Badge>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSummarize} 
              disabled={loading || inputText.trim().split(' ').length < 10}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & Summarizing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
            
            {inputText && (
              <Button 
                onClick={handleClear} 
                variant="outline"
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {summary && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                AI-Generated Summary
              </h3>
              <div className="flex items-center space-x-2">
                {stats && (
                  <Badge variant="outline" className="bg-white">
                    {stats.compressionRatio}% compression
                  </Badge>
                )}
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
              <p className="text-gray-800 leading-relaxed text-sm">{summary}</p>
            </div>

            {stats && (
              <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-green-200">
                <div className="flex items-center space-x-4">
                  <span>Original: {stats.originalLength} chars</span>
                  <span>•</span>
                  <span>Summary: {stats.summaryLength} chars</span>
                </div>
                <Badge variant="secondary" className="bg-white">
                  {stats.compressionRatio}% of original length
                </Badge>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <h4 className="font-medium mb-2">💡 Tips for better summaries:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Use well-structured text with clear sentences</li>
            <li>• Longer texts (100+ words) produce more meaningful summaries</li>
            <li>• The AI removes duplicate content and focuses on key information</li>
            <li>• Try pasting multiple related articles for comprehensive summaries</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default TextSummarizer;
