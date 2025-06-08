
import React from 'react';
import { CheckCircle, Zap, Shield, Globe, Users, Cpu } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Features = () => {
  const mainFeatures = [
    {
      title: 'Advanced AI Vision',
      description: 'State-of-the-art BLIP image captioning and computer vision models for accurate image analysis.',
      icon: Cpu,
      details: ['Real-time image processing', 'Accurate object detection', 'Contextual understanding', 'Multi-language support']
    },
    {
      title: 'Lightning Fast',
      description: 'Optimized performance with instant results and smooth user experience.',
      icon: Zap,
      details: ['Sub-second processing', 'Optimized algorithms', 'Efficient caching', 'Progressive loading']
    },
    {
      title: 'Secure & Private',
      description: 'Your images and data are processed securely with privacy as our top priority.',
      icon: Shield,
      details: ['End-to-end encryption', 'No data storage', 'GDPR compliant', 'Local processing options']
    },
    {
      title: 'Cross-Platform',
      description: 'Works seamlessly across all devices and platforms with responsive design.',
      icon: Globe,
      details: ['Web-based interface', 'Mobile optimized', 'Cross-browser support', 'API access']
    }
  ];

  const capabilities = [
    'Automatic image captioning and description',
    'Intelligent tag extraction and categorization',
    'Natural language search across image collections',
    'Real-time camera integration',
    'Batch processing for multiple images',
    'Export results in multiple formats',
    'Advanced filtering and sorting options',
    'Integration with popular cloud storage services'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Powerful
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              AI Features
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the comprehensive set of AI-powered tools designed to revolutionize 
            how you interact with and understand your image collections.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Capabilities Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You Can Do
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers a comprehensive suite of capabilities to handle all your image analysis needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((capability, index) => (
              <div key={index} className="flex items-center p-4 rounded-xl hover:bg-blue-50 transition-colors">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { number: '10M+', label: 'Images Processed', icon: Cpu },
            { number: '99.9%', label: 'Accuracy Rate', icon: CheckCircle },
            { number: '50K+', label: 'Happy Users', icon: Users }
          ].map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div key={index} className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Experience the Power?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start using our AI-powered image tagging platform today and see the difference.
            </p>
            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors text-lg">
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Features;
