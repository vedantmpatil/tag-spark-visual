
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Search, FileText, Eye, Tag, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
  const features = [
    {
      title: "AI Image Search",
      description: "Upload images and search through them using natural language queries. Our AI automatically generates captions and tags for intelligent search.",
      icon: <Search className="h-8 w-8 text-blue-600" />,
      route: "/",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
    },
    {
      title: "Text Summarizer",
      description: "Transform long articles, documents, or any text into concise, meaningful summaries using advanced AI models that run in your browser.",
      icon: <FileText className="h-8 w-8 text-green-600" />,
      route: "/summarizer",
      color: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
    },
    {
      title: "Live Environment Describer",
      description: "Real-time AI-powered environment description for visually impaired users. Get spoken descriptions of your surroundings using camera and voice commands.",
      icon: <Eye className="h-8 w-8 text-purple-600" />,
      route: "/live-describer",
      color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200",
      isNew: true
    },
    {
      title: "Tag Visualizer",
      description: "Visualize and explore the AI-generated tags and captions from your uploaded images in an interactive interface.",
      icon: <Tag className="h-8 w-8 text-orange-600" />,
      route: "/tags",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200",
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Explore AI Features
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover powerful AI-powered tools for image processing, text analysis, 
            and real-time accessibility features. All powered by cutting-edge machine learning models 
            that run directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 relative overflow-hidden group`}>
              {feature.isNew && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  NEW!
                </div>
              )}
              {feature.comingSoon && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Coming Soon
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed text-gray-700">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Link to={feature.route}>
                  <Button 
                    className={`w-full text-white shadow-lg transition-all duration-300 ${
                      feature.comingSoon 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 hover:shadow-xl hover:scale-105'
                    }`}
                    disabled={feature.comingSoon}
                    size="lg"
                  >
                    {feature.comingSoon ? 'Coming Soon' : `Try ${feature.title}`}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-4xl text-white mb-4">Ready to Get Started?</CardTitle>
              <CardDescription className="text-blue-100 text-xl leading-relaxed">
                Choose any feature above to begin your AI-powered journey. 
                All tools work offline and respect your privacy. Experience the future of 
                assistive technology and intelligent content processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/">
                  <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
                    <Search className="mr-2 h-5 w-5" />
                    Start with Image Search
                  </Button>
                </Link>
                <Link to="/live-describer">
                  <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
                    <Eye className="mr-2 h-5 w-5" />
                    Try Live Describer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Explore;
