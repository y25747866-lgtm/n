
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type Topic = {
  id: string;
  topic: string;
  usage_count: number;
  keywords?: string[];
};

const TopicCard = ({ topic, index }: { topic: Topic; index: number }) => (
  <Link href={`/generate?topic=${encodeURIComponent(topic.topic)}`}>
    <Card className="glass-card hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{topic.topic}</CardTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{topic.usage_count}</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  </Link>
);

const TopicSkeleton = () => (
  <div className="space-y-4 rounded-lg border bg-card p-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-1/6" />
    </div>
  </div>
);

export default function DiscoverPage() {
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'trending_topics');
  }, [firestore]);

  const { data: topics, isLoading, error } = useCollection<Topic>(topicsQuery);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    const lowercasedFilter = searchTerm.toLowerCase();
    
    return topics.filter((topic) => {
        const titleMatch = topic.topic.toLowerCase().includes(lowercasedFilter);
        const keywordMatch = topic.keywords?.some(keyword => keyword.toLowerCase().includes(lowercasedFilter)) || false;
        return titleMatch || keywordMatch;
    }).sort((a, b) => b.usage_count - a.usage_count);

  }, [topics, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Your Next Bestseller
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          Explore trending topics and find the perfect idea for your next digital product.
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <TopicSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && error && (
          <Card className="glass-card">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <h3 className="text-xl font-semibold">Could not load topics</h3>
                    <p className="text-muted-foreground">There was an error fetching trending topics. Please check your connection or try again later.</p>
              </CardContent>
          </Card>
      )}

      {!isLoading && !error && filteredTopics.length === 0 && (
          <Card className="glass-card">
              <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Topics Found</h3>
                    <p className="text-muted-foreground max-w-md">
                        {searchTerm 
                            ? `Your search for "${searchTerm}" did not return any results. Try a different keyword.`
                            : "No trending topics found yet. Create a new product to start a trend!"
                        }
                    </p>
                    <Link href="/generate">
                        <Button>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create a Product
                        </Button>
                    </Link>
              </CardContent>
          </Card>
      )}
      
      {!isLoading && !error && filteredTopics.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTopics.map((topic, index) => (
                <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
        </div>
      )}

    </div>
  );
}

    