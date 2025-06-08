
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUpload from '@/components/ImageUpload';
import SearchInterface from '@/components/SearchInterface';
import ImageGrid from '@/components/ImageGrid';
import StatusBar from '@/components/StatusBar';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            AI Image Tagging & Search
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload images for automatic AI-powered captioning and tag extraction, 
            then search your collection using natural language queries. Experience 
            the future of intelligent image management.
          </p>
        </div>

        <StatusBar />

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-white shadow-lg border-2 border-gray-200">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                Upload Images
              </TabsTrigger>
              <TabsTrigger 
                value="search"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                Search Images
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-8">
              <ImageUpload onUploadComplete={handleUploadComplete} />
              
              {uploadedFiles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
      </div>
    </div>
  );
};

export default Index;
