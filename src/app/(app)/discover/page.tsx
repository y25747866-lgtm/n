
'use client';

import { useMemo, useState } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Flame, BarChart, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type Topic = {
  id: string;
  title: string;
  keywords: string[];
  trend_score: number;
  last_updated: string;
  source: string;
};

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const firestore = useFirestore();

  const topicsQuery = useMemoFirebase(
    () => collection(firestore, 'trending_topics'),
    [firestore]
  );
  const { data: topics, isLoading, error } = useCollection<Topic>(topicsQuery);

  const sortedTopics = useMemo(() => {
    if (!topics) return [];
    // Sort by trend_score in descending order
    return [...topics].sort((a, b) => b.trend_score - a.trend_score);
  }, [topics]);

  const filteredTopics = useMemo(() => {
    if (!sortedTopics) return [];
    if (!debouncedSearch.trim()) {
      return sortedTopics;
    }
    const searchQuery = debouncedSearch.toLowerCase();
    const searchWords = searchQuery.split(/\s+/).filter(Boolean);
    
    return sortedTopics.filter((topic) => {
      const searchableText = [
        topic.title,
        ...(topic.keywords || [])
      ].join(' ').toLowerCase();
      
      return searchWords.every((word) => searchableText.includes(word));
    });
  }, [debouncedSearch, sortedTopics]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border bg-card/60 p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <TrendingDown className="h-12 w-12 text-destructive" />
            <h3 className="text-xl font-semibold">Could not load trends</h3>
            <p className="text-muted-foreground max-w-md">
              There was a problem fetching data from Firestore. Check the console for more details.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    if (!topics || topics.length === 0 && !isLoading) {
        return (
          <Card className="glass-card">
            <CardContent className="p-10 flex flex-col items-center text-center gap-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Waiting for Trends</h3>
              <p className="text-muted-foreground max-w-md">
                The trend-syncing function is warming up. Real-world trends from Google will appear here shortly.
              </p>
            </CardContent>
          </Card>
        );
    }

    if (filteredTopics.length === 0) {
      return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Trends Found</h3>
            <p className="text-muted-foreground max-w-md">
              Your search for "{debouncedSearch}" didn't match any of the current Google Trends. Try a different keyword.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic, index) => {
          const isHot = topic.trend_score > 85;
          const lastUpdated = topic.last_updated ? new Date(topic.last_updated) : null;

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass-card flex h-full flex-col p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <CardHeader className="flex-row items-start justify-between p-2">
                    <CardTitle className="text-lg font-bold">{topic.title}</CardTitle>
                    {isHot && (
                        <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive shrink-0">
                        <Flame className="h-3 w-3" />
                        <span>Hot</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-2 flex-1">
                  <div className="flex flex-wrap gap-1">
                    {topic.keywords?.slice(0, 3).map(kw => <Badge variant="secondary" key={kw}>{kw}</Badge>)}
                  </div>
                </CardContent>
                <div className="flex items-end justify-between text-xs p-2 mt-auto">
                  <div className="flex items-center gap-2" title="Google Trends Score">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">{topic.trend_score} / 100</span>
                  </div>
                   {lastUpdated && (
                     <div className="flex items-center gap-1 text-muted-foreground" title={`Last updated: ${lastUpdated.toLocaleString()}`}>
                        <Clock className="h-3 w-3"/>
                        <span>{formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
                     </div>
                   )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Your Next Bestseller
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore real-time data from Google Trends to find your next digital product idea.
        </p>
      </div>
      
      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a trend like 'AI', 'Passive Income', or 'Notion'..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 h-12 text-base"
          disabled={isLoading && !topics}
        />
      </div>

      {renderContent()}
    </div>
  );
}

    