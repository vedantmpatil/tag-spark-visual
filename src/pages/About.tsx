
import React from 'react';
import { Heart, Target, Users, Lightbulb } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To democratize AI-powered image analysis and make advanced computer vision accessible to everyone.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Heart,
      title: 'Our Passion',
      description: 'We believe in the transformative power of AI to help people better understand and organize their visual content.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Constantly pushing the boundaries of what\'s possible with cutting-edge AI research and development.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive community of creators, researchers, and innovators who share our vision.',
      color: 'from-green-500 to-green-600'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'AI Research Lead',
      description: 'PhD in Computer Vision from Stanford. 10+ years in deep learning research.',
      avatar: '/api/placeholder/150/150'
    },
    {
      name: 'Alex Rodriguez',
      role: 'Lead Developer',
      description: 'Full-stack engineer with expertise in React, Python, and machine learning infrastructure.',
      avatar: '/api/placeholder/150/150'
    },
    {
      name: 'Emma Johnson',
      role: 'UX Designer',
      description: 'Design thinking expert focused on making AI accessible through intuitive interfaces.',
      avatar: '/api/placeholder/150/150'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              AI Vision
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We're a team of passionate researchers, engineers, and designers dedicated to making 
            artificial intelligence more accessible and useful for everyone. Our mission is to bridge 
            the gap between cutting-edge AI research and practical, everyday applications.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Founded in 2023, AI Vision emerged from a simple observation: while AI technology was advancing 
                rapidly, there was still a significant gap between research breakthroughs and practical tools 
                that everyday users could actually benefit from.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Our journey began when our founding team, frustrated by the complexity of existing computer 
                vision tools, decided to build something different. We wanted to create a platform that would 
                harness the power of state-of-the-art AI models while remaining intuitive enough for anyone to use.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, we're proud to serve thousands of users worldwide, from content creators and researchers 
                to businesses and hobbyists, all united by the goal of better understanding and organizing 
                their visual content through the power of AI.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              
              return (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Technology</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We leverage cutting-edge AI models and frameworks to deliver the best possible experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { name: 'BLIP', description: 'Image Captioning' },
              { name: 'spaCy', description: 'NLP Processing' },
              { name: 'PyTorch', description: 'Deep Learning' },
              { name: 'React', description: 'User Interface' }
            ].map((tech, index) => (
              <div key={index} className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{tech.name}</h4>
                <p className="text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl mb-8 opacity-90">
              Have questions or want to collaborate? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors">
                Contact Us
              </button>
              <button className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 transition-colors">
                Join Our Community
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
