
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, BarChart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useState, useTransition, useEffect, Suspense, useCallback } from 'react';
import { suggestTrendingIdeas, SuggestTrendingIdeasOutput } from '@/ai/flows/suggest-trending-ideas';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const filters = ['Amazon PLR', 'Etsy Digital', 'Udemy', 'Google Trends', 'Future Prediction'];

// In-memory cache using a Map, defined at the module level to persist across re-renders and navigations.
const ideasCache = new Map<string, SuggestTrendingIdeasOutput['ideas']>();

function TrendingIdeasPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSearching, startSearchTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTopic, setCurrentTopic] = useState('trending digital products');

  // Initialize state with cached data if it exists for the default topic.
  const [trendingIdeas, setTrendingIdeas] = useState<SuggestTrendingIdeasOutput['ideas']>(
    () => ideasCache.get(currentTopic) || []
  );

  const handleUseTrend = (topic: string) => {
    router.push(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  const fetchIdeas = useCallback(
    (topic: string) => {
      // If data is already in cache for the topic, just use it.
      if (ideasCache.has(topic)) {
        setTrendingIdeas(ideasCache.get(topic)!);
        return;
      }

      // Show loading skeletons for the new topic.
      setTrendingIdeas([]);
      startSearchTransition(async () => {
        try {
          const result = await suggestTrendingIdeas({ topic });
          if (result?.ideas) {
            ideasCache.set(topic, result.ideas);
            setTrendingIdeas(result.ideas);
          } else {
            throw new Error('API returned an unexpected response.');
          }
        } catch (error) {
          console.error('Failed to fetch trending ideas:', error);
          toast({
            title: 'Error Fetching Ideas',
            description: 'Could not fetch new trending ideas. Please try again later.',
            variant: 'destructive',
          });
          // If the fetch fails, ensure we don't show an empty page if old data exists.
          setTrendingIdeas(ideasCache.get(currentTopic) || []);
        }
      });
    },
    [toast, currentTopic] // currentTopic is a dependency to restore previous state on error
  );

  // Fetch ideas only on initial load if the cache is empty for the default topic.
  useEffect(() => {
    if (!ideasCache.has(currentTopic)) {
      fetchIdeas(currentTopic);
    }
  }, []); // Runs only once on mount

  const handleSearch = () => {
    const trimmedTerm = searchTerm.trim();
    // Only search if the term is new and not empty
    if (trimmedTerm && trimmedTerm !== currentTopic) {
      setCurrentTopic(trimmedTerm);
      fetchIdeas(trimmedTerm);
    }
  };

  const handleFilterClick = (filter: string) => {
    // Only fetch if the filter is different from the current topic
    if (filter !== currentTopic) {
      setSearchTerm(filter);
      setCurrentTopic(filter);
      fetchIdeas(filter);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // isLoading should be true only when a search is in progress for a topic not in the cache.
  const isLoading = isSearching && !ideasCache.has(currentTopic);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trending Ideas</h1>
        <p className="text-muted-foreground">Discover your next bestselling digital product.</p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Input
            placeholder="Search for a topic to find trends..."
            className="h-12 pr-28"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
          />
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
          >
            {isSearching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Search
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={currentTopic === filter ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => handleFilterClick(filter)}
              disabled={isSearching}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="glass-card flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          trendingIdeas.map((idea, index) => (
            <Card key={index} className="glass-card flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{idea.title}</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BarChart className="h-3 w-3" />
                    {idea.trendScore}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground text-sm">{idea.rationale}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleUseTrend(idea.title)}>
                  Use This Trend <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function TrendingIdeasPage() {
  return (
    <Suspense fallback={<div>Loading trending ideas...</div>}>
      <TrendingIdeasPageContent />
    </Suspense>
  );
}
