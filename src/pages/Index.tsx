
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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI Image Search
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload images for automatic AI-powered captioning and tag extraction, 
          then search your collection using natural language queries.
        </p>
      </div>

      <StatusBar />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="search">Search Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <ImageUpload onUploadComplete={handleUploadComplete} />
          
          {uploadedFiles.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
                Recently Uploaded Images
              </h2>
              <ImageGrid 
                uploadedFiles={uploadedFiles}
                mode="upload"
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="search" className="space-y-6">
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
  );
};

export default Index;
