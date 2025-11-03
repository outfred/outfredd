import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner@2.0.3';

export const TestScraper: React.FC = () => {
  const [url, setUrl] = useState('https://asilieg.com/collections/all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testScraper = async () => {
    setLoading(true);
    setResults(null);

    try {
      // Direct test of scraper
      const response = await fetch(url);
      const html = await response.text();
      
      // Try JSON API
      const urlObj = new URL(url);
      let jsonUrl = url;
      
      if (url.includes('/collections/')) {
        const collectionMatch = url.match(/\/collections\/([^\/\?]+)/);
        if (collectionMatch) {
          jsonUrl = `${urlObj.origin}/collections/${collectionMatch[1]}/products.json`;
        }
      } else {
        jsonUrl = `${urlObj.origin}/products.json`;
      }

      console.log('Trying JSON URL:', jsonUrl);
      
      const jsonResponse = await fetch(jsonUrl);
      const jsonData = await jsonResponse.json();
      
      setResults({
        htmlSize: html.length,
        jsonUrl,
        jsonStatus: jsonResponse.status,
        productsCount: jsonData.products?.length || 0,
        firstProduct: jsonData.products?.[0] || null,
        jsonKeys: Object.keys(jsonData)
      });

      toast.success(`Found ${jsonData.products?.length || 0} products!`);
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(error.message);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">🧪 Scraper Tester</h1>
        
        <Card className="p-6 mb-6">
          <Label>Test URL</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/collections/all"
            />
            <Button onClick={testScraper} disabled={loading}>
              {loading ? 'Testing...' : 'Test'}
            </Button>
          </div>
        </Card>

        {results && (
          <Card className="p-6">
            <h2 className="text-xl mb-4">Results</h2>
            <pre className="bg-black/5 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};
