
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Github, Heart, Brain } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Image & Text Hub</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Advanced AI-powered tools for image tagging, text summarization, and real-time analysis. 
              Built with cutting-edge machine learning models.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Features</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• AI Image Search & Tagging</li>
              <li>• Intelligent Text Summarization</li>
              <li>• Real-time Camera Analysis</li>
              <li>• Privacy-First Design</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">About</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              This application runs entirely in your browser using WebAssembly and local AI models. 
              No data is sent to external servers, ensuring complete privacy.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Github className="h-4 w-4" />
              <span>Open Source</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>Made with Love</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2024 AI Image & Text Hub. All rights reserved.</p>
          <p>Powered by BLIP, T5, spaCy & HuggingFace Transformers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
