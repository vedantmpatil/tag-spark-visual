
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface Status {
  status: string;
  total_images: number;
  models_loaded: {
    blip: boolean;
    spacy: boolean;
  };
}

const StatusBar: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-600">Checking system status...</span>
        </div>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="p-4 mb-6 border-red-200 bg-red-50">
        <div className="flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">Backend not available</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">System Online</span>
          </div>
          
          <Badge variant="outline">
            {status.total_images} images
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {status.models_loaded.blip ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span className="text-xs text-gray-600">BLIP</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {status.models_loaded.spacy ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span className="text-xs text-gray-600">spaCy</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatusBar;
