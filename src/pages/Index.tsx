
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUpload from '@/components/ImageUpload';
import SearchInterface from '@/components/SearchInterface';
import ImageGrid from '@/components/ImageGrid';
import StatusBar from '@/components/StatusBar';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface SearchResult {
  filename: string;
  original_name: string;
  matched_tags: string[];
  caption: string;
  score: number;
}

interface ProcessedFile {
  filename: string;
  original_name: string;
  caption: string;
  tags: string[];
}

const Index = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadComplete = (files: ProcessedFile[]) => {
    setUploadedFiles(files);
    setActiveTab('upload');
  };

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  const handleSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Image Tagging &
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              Search
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload images for automatic AI-powered captioning and tag extraction, 
            then search your collection using natural language queries.
          </p>
        </div>

        <StatusBar />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-white/70 backdrop-blur-sm border border-gray-200/50">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Upload Images
            </TabsTrigger>
            <TabsTrigger 
              value="search"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Search Images
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-8">
            <ImageUpload onUploadComplete={handleUploadComplete} />
            
            {uploadedFiles.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Recently Uploaded Images
                </h2>
                <ImageGrid 
                  uploadedFiles={uploadedFiles}
                  mode="upload"
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="search" className="space-y-8">
            <SearchInterface 
              onSearchResults={handleSearchResults}
              onSearchQuery={handleSearchQuery}
            />
            
            <div>
              <ImageGrid 
                results={searchResults}
                searchQuery={searchQuery}
                mode="search"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
