
'use client';

import { useMemo, useState } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Flame, BarChart, Clock, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type Topic = {
  id: string;
  title: string;
  keywords: string[];
  usage_count: number;
  last_month_usage_count: number;
  last_updated?: string;
};

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const firestore = useFirestore();

  const topicsQuery = useMemoFirebase(
    () => query(collection(firestore, 'trending_topics'), orderBy("usage_count", "desc")),
    [firestore]
  );
  const { data: topics, isLoading, error } = useCollection<Topic>(topicsQuery);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!debouncedSearch.trim()) {
      return topics;
    }
    const searchText = debouncedSearch.toLowerCase();
    
    return topics.filter((topic) => {
      const titleMatch = topic.title.toLowerCase().includes(searchText);
      const keywordMatch = topic.keywords?.some((kw) => kw.toLowerCase().includes(searchText));
      return titleMatch || keywordMatch;
    });
  }, [debouncedSearch, topics]);

  const renderContent = () => {
    if (isLoading && !topics) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4 rounded-lg border bg-card/60 p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
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
    
    if (!topics || topics.length === 0) {
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
          const growth = topic.last_month_usage_count
            ? ((topic.usage_count - topic.last_month_usage_count) / topic.last_month_usage_count) * 100
            : topic.usage_count > 0 ? 100 : 0; // Assume 100% growth if it's new
          const growthText = growth >= 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
          const isHot = growth > 30;

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
                        <Badge variant="destructive" className="flex items-center gap-1 shrink-0">
                          <Flame className="h-3 w-3" />
                          <span>Hot</span>
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-2 flex-1">
                  <p className="text-sm text-muted-foreground">
                    Used {topic.usage_count} times this month.
                  </p>
                </CardContent>
                <div className="flex items-end justify-between text-xs p-2 mt-auto">
                  <div className="flex items-center gap-2" title="Monthly Growth">
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                    <span className={growth >= 0 ? "font-semibold text-green-400" : "font-semibold text-red-400"}>
                      {growth >= 0 ? "📈" : "📉"} {growthText}
                    </span>
                  </div>
                   {topic.last_updated && (
                     <div className="flex items-center gap-1 text-muted-foreground" title={`Last updated`}>
                        <Clock className="h-3 w-3"/>
                        <span>{formatDistanceToNow(new Date(topic.last_updated), { addSuffix: true })}</span>
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
