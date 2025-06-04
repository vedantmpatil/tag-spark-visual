
import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SearchResult {
  filename: string;
  original_name: string;
  matched_tags: string[];
  caption: string;
  score: number;
}

interface SearchInterfaceProps {
  onSearchResults: (results: SearchResult[]) => void;
  onSearchQuery: (query: string) => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearchResults, onSearchQuery }) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setSearching(true);
    onSearchQuery(query);

    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result = await response.json();
      onSearchResults(result.results || []);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search images by description (e.g., 'brown dog', 'red car', 'sunset beach')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={searching}
          />
        </div>
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Card>
  );
};

export default SearchInterface;
