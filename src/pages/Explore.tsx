
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Search, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
  const features = [
    {
      title: "AI Image Search",
      description: "Upload images and search through them using natural language queries. Our AI automatically generates captions and tags for intelligent search.",
      icon: <Search className="h-8 w-8 text-blue-600" />,
      route: "/",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Text Summarizer",
      description: "Transform long articles, documents, or any text into concise, meaningful summaries using advanced AI models that run in your browser.",
      icon: <FileText className="h-8 w-8 text-green-600" />,
      route: "/summarizer",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Real-time Camera",
      description: "Access live camera feed for real-time image analysis and processing. Perfect for instant AI-powered visual recognition.",
      icon: <Camera className="h-8 w-8 text-purple-600" />,
      route: "/camera",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Tag Visualizer",
      description: "Visualize and explore the AI-generated tags and captions from your uploaded images in an interactive interface.",
      icon: <Eye className="h-8 w-8 text-orange-600" />,
      route: "/tags",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Explore AI Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover powerful AI-powered tools for image processing, text analysis, 
            and real-time visual recognition. All powered by cutting-edge machine learning models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {feature.icon}
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={feature.route}>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    Try {feature.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Ready to Get Started?</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Choose any feature above to begin your AI-powered journey. 
                All tools work offline and respect your privacy.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Explore;
