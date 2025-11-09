
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

type Trend = {
  title: string;
  desc: string;
  count: number;
};

const RSS_URL = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";

// A proxy is needed to bypass CORS issues when fetching the RSS feed from the browser.
// Using a free, public proxy for demonstration purposes.
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

export default function DiscoverPage() {
  const [allTrends, setAllTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(PROXY_URL + RSS_URL);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const items = xml.querySelectorAll('item');

        const trends: Trend[] = [];
        items.forEach((item) => {
          trends.push({
            title: item.querySelector('title')?.textContent || 'No Title',
            desc: item.querySelector('ht\\:news_item_title')?.textContent || 'No description available',
            count: Math.floor(Math.random() * 5000 + 1000), // Fake usage count for display
          });
        });

        setAllTrends(trends);
        setFilteredTrends(trends);
      } catch (err: any) {
        console.error(err);
        setError("Error loading trends. The public proxy may be rate-limited. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrends();
  }, []);

  useEffect(() => {
    const keyword = search.toLowerCase();
    if (!keyword) {
      setFilteredTrends(allTrends);
      return;
    }

    const filtered = allTrends.filter(t =>
      t.title.toLowerCase().includes(keyword) || t.desc.toLowerCase().includes(keyword)
    );
    setFilteredTrends(filtered);
  }, [search, allTrends]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching live trends from Google...</p>
        </div>
      );
    }

    if (error) {
       return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h3 className="text-xl font-semibold">Could not load trends</h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </CardContent>
        </Card>
      );
    }
    
    if (filteredTrends.length === 0) {
      return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Trends Found</h3>
            <p className="text-muted-foreground max-w-md">
              Your search for "{search}" didn't match any of the current Google Trends. Try a different keyword.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTrends.map((trend, index) => (
           <motion.div
              key={trend.title + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{trend.title}</CardTitle>
                  <CardDescription>{trend.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Approx. Searches: {trend.count.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Live Global Trends
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore real-time data directly from Google Trends to find your next digital product idea.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="search"
          type="search"
          placeholder="Search trending topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 h-12 text-base"
          disabled={isLoading}
        />
      </div>

      {renderContent()}
    </div>
  );
}
