
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Search, FileText, Camera, Compass, Eye } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Image Search', icon: <Search className="h-4 w-4" /> },
    { path: '/summarizer', label: 'Text Summarizer', icon: <FileText className="h-4 w-4" /> },
    { path: '/live-describer', label: 'Live Describer', icon: <Eye className="h-4 w-4" /> },
    { path: '/explore', label: 'Explore', icon: <Compass className="h-4 w-4" /> },
  ];

  return (
    <nav className="bg-white border-b shadow-lg sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/explore" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Hub
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 transition-all hover:scale-105 ${
                    location.pathname === item.path 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
