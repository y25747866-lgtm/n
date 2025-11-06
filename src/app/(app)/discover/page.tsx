
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, Sparkles, AlertTriangle, ArrowUp, ArrowDown, Flame } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';

type Topic = {
  id: string;
  topic: string;
  usage_count: number;
  last_month_usage_count: number;
  keywords?: string[];
};

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const TrendIndicator = ({ current, previous }: { current: number; previous: number }) => {
    if (previous === 0) {
      if (current > 0) {
        return (
          <div className="flex items-center text-xs text-green-500 font-medium">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>New</span>
          </div>
        );
      }
      return null;
    }
  
    const percentageChange = ((current - previous) / previous) * 100;
  
    if (Math.abs(percentageChange) < 1) {
      return null;
    }
  
    const isPositive = percentageChange > 0;
  
    return (
      <div className={cn("flex items-center text-xs font-medium", isPositive ? "text-green-500" : "text-red-500")}>
        {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
        <span>{isPositive && '+'}{percentageChange.toFixed(0)}%</span>
      </div>
    );
};

const isHotTopic = (current: number, previous: number) => {
    if (previous === 0) return current > 10; // New and already popular
    const percentageChange = ((current - previous) / previous) * 100;
    return percentageChange > 10;
};


const TopicCard = ({ topic, index }: { topic: Topic; index: number }) => {
    const hot = isHotTopic(topic.usage_count, topic.last_month_usage_count);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={`/generate?topic=${encodeURIComponent(topic.topic)}`} className="block h-full">
            <Card className="glass-card hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                <CardContent className="p-4 flex flex-col flex-1">
                {hot && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-2">
                        <Flame className="h-4 w-4" />
                        <span>Hot Topic</span>
                    </div>
                )}
                <h3 className="font-bold text-base flex-1">{topic.topic}</h3>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <TrendingUp className="h-4 w-4" />
                        <span>{topic.usage_count} users</span>
                    </div>
                    <TrendIndicator current={topic.usage_count} previous={topic.last_month_usage_count} />
                </div>
                </CardContent>
            </Card>
            </Link>
        </motion.div>
    );
};


const TopicSkeleton = () => (
  <Card className="glass-card">
    <CardContent className="p-4">
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
        </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ topics, searchTerm }: { topics: Topic[] | null, searchTerm: string }) => {
    const top5Topics = useMemo(() => topics?.slice(0, 5) || [], [topics]);

    return (
        <Card className="glass-card col-span-1 md:col-span-2 lg:col-span-3">
            <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                <Search className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Topics Found</h3>
                <p className="text-muted-foreground max-w-md">
                    {searchTerm
                        ? `Your search for "${searchTerm}" did not return any results. Try a different keyword.`
                        : "No trending topics found yet. Create a new product to start a trend!"
                    }
                </p>
                {searchTerm && top5Topics.length > 0 && (
                    <div className="mt-4 text-left w-full max-w-md">
                        <h4 className="font-semibold mb-2 text-center">Or, try one of these popular topics:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {top5Topics.map(topic => (
                                <Link href={`/generate?topic=${encodeURIComponent(topic.topic)}`} key={topic.id}>
                                    <Button variant="outline" size="sm">{topic.topic}</Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                {!searchTerm && (
                    <Link href="/generate">
                        <Button>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create a Product
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
};

export default function DiscoverPage() {
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'trending_topics'), orderBy('usage_count', 'desc'));
  }, [firestore]);

  const { data: topics, isLoading, error } = useCollection<Topic>(topicsQuery);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!debouncedSearchTerm) {
      return topics;
    }

    const searchWords = debouncedSearchTerm.toLowerCase().split(' ').filter(word => word.length > 0);

    return topics.filter((topic) => {
        const topicText = topic.topic.toLowerCase();
        const topicKeywords = topic.keywords?.map(k => k.toLowerCase()) || [];
        
        // Combine title and keywords into a single searchable string
        const searchableContent = topicText + " " + topicKeywords.join(" ");

        // Check if all search words are present in the searchable content
        return searchWords.every(word => searchableContent.includes(word));
    });

  }, [topics, debouncedSearchTerm]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Your Next Bestseller
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          Explore what's currently trending and find the perfect idea for your next digital product.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a topic like 'AI', 'Health', or 'Finance'..."
          className="w-full pl-10 h-12 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <TopicSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && error && (
          <Card className="glass-card col-span-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <h3 className="text-xl font-semibold">Could not load topics</h3>
                    <p className="text-muted-foreground">There was an error fetching trending topics. Please check your connection or try again later.</p>
              </CardContent>
          </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
            {!isLoading && !error && filteredTopics.length > 0 && (
                filteredTopics.map((topic, index) => (
                    <TopicCard key={topic.id} topic={topic} index={index} />
                ))
            )}
        </AnimatePresence>
      </div>

      {!isLoading && !error && filteredTopics.length === 0 && (
        <EmptyState topics={topics} searchTerm={debouncedSearchTerm} />
      )}

    </div>
  );
}
