
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ImageGridProps {
  results?: SearchResult[];
  uploadedFiles?: ProcessedFile[];
  searchQuery?: string;
  mode: 'search' | 'upload';
}

const ImageGrid: React.FC<ImageGridProps> = ({ results = [], uploadedFiles = [], searchQuery, mode }) => {
  const items = mode === 'search' ? results : uploadedFiles;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {mode === 'search' 
            ? (searchQuery ? `No results found for "${searchQuery}"` : 'Enter a search query to find images')
            : 'No images uploaded yet'
          }
        </h3>
        <p className="text-gray-500">
          {mode === 'search' 
            ? 'Try different keywords or upload some images first'
            : 'Upload images to get started with AI-powered tagging'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <Card key={item.filename} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="aspect-video relative overflow-hidden bg-gray-100">
            <img
              src={`http://localhost:5000/images/${item.filename}`}
              alt={item.original_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {mode === 'search' && 'score' in item && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                Score: {item.score}
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-2 truncate" title={item.original_name}>
              {item.original_name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {item.caption}
            </p>
            
            <div className="space-y-2">
              {mode === 'search' && 'matched_tags' in item && item.matched_tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">Matched Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.matched_tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {'tags' in item && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">All Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 6).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ImageGrid;
