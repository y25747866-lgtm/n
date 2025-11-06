
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Flame, BarChart, Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';
import { fetchTrends } from '@/ai/flows/fetch-trends-flow';
import { MarketTrend } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadTrends() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTrends = await fetchTrends();
        setTrends(fetchedTrends);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch market trends. The AI analyst might be on a coffee break.');
      } finally {
        setIsLoading(false);
      }
    }
    loadTrends();
  }, []);

  const filteredTrends = useMemo(() => {
    if (!trends) return [];
    if (!debouncedSearch.trim()) {
      return trends;
    }
    const searchQuery = debouncedSearch.toLowerCase();
    return trends.filter((trend) =>
      trend.topic.toLowerCase().includes(searchQuery) ||
      trend.rationale.toLowerCase().includes(searchQuery)
    );
  }, [debouncedSearch, trends]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="space-y-4 rounded-lg border bg-card/60 p-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-full" />
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
              Your search for "{debouncedSearch}" didn't return any results. Try a different keyword.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TooltipProvider>
        {filteredTrends.map((trend, index) => {
          const isHot = trend.trendScore > 85;
          return (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass-card flex h-full flex-col p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <CardHeader className="flex-row items-start justify-between p-2">
                    <h2 className="text-lg font-bold">{trend.topic}</h2>
                    {isHot && (
                        <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                        <Flame className="h-3 w-3" />
                        <span>Hot</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-2 flex-1">
                    <p className="mb-4 text-sm text-muted-foreground">
                        {trend.rationale}
                    </p>
                </CardContent>
                <div className="flex items-end justify-between text-xs p-2 mt-auto">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-primary">{trend.trendScore} / 100 Score</span>
                  </div>
                   <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="font-semibold text-muted-foreground underline decoration-dashed cursor-help">
                                {trend.source}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Primary data source</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
              </Card>
            </motion.div>
          );
        })}
        </TooltipProvider>
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
          Explore AI-analyzed market trends for your next digital product.
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
          disabled={isLoading}
        />
      </div>

      {renderContent()}
    </div>
  );
}
