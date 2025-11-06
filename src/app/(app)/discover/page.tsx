
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';

type Topic = {
  id: string;
  topic: string;
  usage_count: number;
  last_month_usage_count: number;
  keywords?: string[];
};

export default function DiscoverPage() {
  const { firestore } = useFirebase();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'trending_topics'),
      orderBy('usage_count', 'desc')
    );
  }, [firestore]);

  const { data: topics, isLoading, error } = useCollection<Topic>(topicsQuery);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!debouncedSearch.trim()) {
      return topics;
    }

    const searchQuery = debouncedSearch.toLowerCase();
    const words = searchQuery.split(' ').filter(Boolean);

    const results = topics.filter((topic) => {
        const searchableText = `${(topic.topic || '').toLowerCase()} ${(topic.keywords || []).join(' ').toLowerCase()}`;
        return words.every((word) => searchableText.includes(word));
    });

    if (results.length > 0) {
      return results;
    }

    // Fallback: suggest top 5 trending if no results found from search
    return topics.slice(0, 5);

  }, [debouncedSearch, topics]);

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // New topic, show 100% growth if it has usage
    }
    return (((current - previous) / previous) * 100);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-36 animate-pulse bg-muted/50" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="glass-card">
                <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                    <TrendingDown className="h-12 w-12 text-destructive" />
                    <h3 className="text-xl font-semibold">Could not load topics</h3>
                    <p className="text-muted-foreground max-w-md">
                        There was an error fetching the trending topics from the database. Please ensure your connection and permissions are correct.
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (filteredTopics.length === 0) {
        return (
            <Card className="glass-card">
                <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Topics Found</h3>
                    <p className="text-muted-foreground max-w-md">
                        {search.trim().length > 0
                        ? "Your search didn't return any results. Try a different keyword."
                        : "There are no trending topics yet. Generate a product to start a trend!"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic, index) => {
          const trend = getTrend(topic.usage_count, topic.last_month_usage_count);
          const isHot = trend > 10;
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass-card flex h-full flex-col p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="mb-2 flex items-start justify-between">
                  <h2 className="text-lg font-bold">{topic.topic}</h2>
                  {isHot && (
                    <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                      <Flame className="h-3 w-3" />
                      <span>Hot</span>
                    </div>
                  )}
                </div>
                <p className="mb-4 flex-1 text-sm text-muted-foreground">
                  {topic.keywords?.join(' • ')}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">
                    {topic.usage_count} users this month
                  </span>
                  <span
                    className={cn(
                      'flex items-center font-semibold',
                      trend >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {trend >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {trend.toFixed(0)}%
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Your Next Bestseller
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore trending topics and find the perfect idea for your next digital product.
        </p>
      </div>
      
      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a topic like 'AI', 'Health', or 'Finance'..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 h-12 text-base"
        />
      </div>

      {renderContent()}
    </div>
  );
}
