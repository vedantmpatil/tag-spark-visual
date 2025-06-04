
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText, Video, ArrowRight, Sparkles } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      title: 'Image Search',
      description: 'Upload images and search them using natural language. AI automatically generates tags and captions.',
      icon: Search,
      path: '/image-search',
      color: 'from-blue-500 to-cyan-500',
      features: ['BLIP Image Captioning', 'spaCy Tag Extraction', 'Smart Search Results']
    },
    {
      title: 'Text Summarizer',
      description: 'Paste long text or multiple captions to get a concise, deduplicated summary using T5.',
      icon: FileText,
      path: '/text-summarizer',
      color: 'from-green-500 to-emerald-500',
      features: ['TF-IDF Deduplication', 'T5 Summarization', 'Smart Compression']
    },
    {
      title: 'Video Summary',
      description: 'Upload videos to extract key frames, generate captions, and create intelligent summaries.',
      icon: Video,
      path: '/video-summary',
      color: 'from-purple-500 to-pink-500',
      features: ['Frame Difference Detection', 'Caption Generation', 'Video Summarization']
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            AI Content Suite
          </h1>
        </div>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A powerful collection of AI tools for content analysis and processing. 
          Search images, summarize text, and analyze videos with cutting-edge machine learning models.
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <Badge>BLIP Image Captioning</Badge>
          <Badge>T5 Text Summarization</Badge>
          <Badge>spaCy NLP</Badge>
          <Badge>OpenCV Video Processing</Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 border-0 bg-white/70 backdrop-blur-sm">
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {feature.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
                
                <Link to={feature.path}>
                  <Button className="w-full group">
                    Try {feature.title}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats Section */}
      <Card className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-0">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Powered by State-of-the-Art AI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our application uses the latest machine learning models running locally 
            for privacy and performance. No external API calls required.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">BLIP</div>
              <div className="text-sm text-gray-500">Image Captioning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">T5</div>
              <div className="text-sm text-gray-500">Text Summarization</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">spaCy</div>
              <div className="text-sm text-gray-500">NLP Processing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">OpenCV</div>
              <div className="text-sm text-gray-500">Video Analysis</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
    {children}
  </span>
);

export default HomePage;
