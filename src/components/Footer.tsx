
import React from 'react';
import { Brain, Heart, Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Hub
              </span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Empowering users with AI-powered tools for image processing, text analysis, 
              and accessibility features. Built with cutting-edge technology to make AI 
              accessible to everyone.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400" />
              <span>for accessibility and innovation</span>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Image Search & Tagging
                </Link>
              </li>
              <li>
                <Link to="/summarizer" className="hover:text-blue-400 transition-colors">
                  Text Summarization
                </Link>
              </li>
              <li>
                <Link to="/live-describer" className="hover:text-blue-400 transition-colors">
                  Live Environment Describer
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-blue-400 transition-colors">
                  Explore All Features
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-400">About</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <span className="block">
                  Privacy-First AI Tools
                </span>
              </li>
              <li>
                <span className="block">
                  Accessibility Focused
                </span>
              </li>
              <li>
                <span className="block">
                  Browser-Based Processing
                </span>
              </li>
              <li>
                <span className="block">
                  Open Source Technology
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Credits */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              <p>Powered by BLIP image captioning, HuggingFace Transformers, and spaCy NLP</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© 2024 AI Hub. Built for everyone.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
