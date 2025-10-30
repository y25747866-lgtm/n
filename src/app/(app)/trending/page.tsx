
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, BarChart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useState, useTransition, Suspense, useCallback } from 'react';
import { suggestTrendingIdeas, SuggestTrendingIdeasOutput } from '@/ai/flows/suggest-trending-ideas';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const filters = ['Amazon PLR', 'Etsy Digital', 'Udemy', 'Google Trends', 'Future Prediction'];

// In-memory cache using a Map to store search results.
const ideasCache = new Map<string, SuggestTrendingIdeasOutput['ideas']>();

const defaultIdeas: SuggestTrendingIdeasOutput['ideas'] = [
    {
      "title": "AI-Powered Ebook Generator",
      "rationale": "With the rise of generative AI, tools that automate content creation are in high demand. An ebook generator appeals to marketers, writers, and entrepreneurs.",
      "trendScore": 95
    },
    {
      "title": "Niche-Specific Notion Templates",
      "rationale": "Notion's popularity continues to soar. Users are looking for well-designed templates for specific needs like project management, personal finance, or fitness tracking.",
      "trendScore": 90
    },
    {
      "title": "Personalized Digital Planners",
      "rationale": "The demand for digital organization tools is evergreen. Planners that can be customized for specific goals or aesthetics are highly sought after on platforms like Etsy.",
      "trendScore": 88
    },
    {
      "title": "Micro-SaaS Boilerplates (Next.js/Firebase)",
      "rationale": "Developers are always looking for starters to kickstart their projects. A boilerplate with pre-integrated authentication, payments, and database setup is a huge time-saver.",
      "trendScore": 85
    },
    {
      "title": "Short-Form Video (Reels/TikToks) Course",
      "rationale": "As video marketing dominates social media, creators and businesses are desperate to learn how to create engaging short-form content that goes viral.",
      "trendScore": 92
    },
    {
      "title": "Customizable Canva Template Bundles",
      "rationale": "Canva has empowered non-designers to create stunning visuals. Bundles of templates for social media, presentations, and marketing materials are consistent bestsellers.",
      "trendScore": 89
    }
  ];

// Pre-populate the cache with default ideas
const initialTopic = 'trending digital products';
ideasCache.set(initialTopic, defaultIdeas);

function TrendingIdeasPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSearching, startSearchTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTopic, setCurrentTopic] = useState(initialTopic);

  // Initialize state directly with the default ideas.
  const [trendingIdeas, setTrendingIdeas] = useState<SuggestTrendingIdeasOutput['ideas']>(defaultIdeas);

  const handleUseTrend = (topic: string) => {
    router.push(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  const fetchIdeas = useCallback(
    (topic: string) => {
      const cachedIdeas = ideasCache.get(topic);
      if (cachedIdeas) {
        setTrendingIdeas(cachedIdeas);
        setCurrentTopic(topic);
        return;
      }

      setTrendingIdeas([]); // Clear current ideas to show loading state

      startSearchTransition(async () => {
        try {
          const result = await suggestTrendingIdeas({ topic });
          if (result?.ideas) {
            ideasCache.set(topic, result.ideas);
            setTrendingIdeas(result.ideas);
            setCurrentTopic(topic);
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
          // Restore to default ideas on error
          setTrendingIdeas(defaultIdeas);
          setCurrentTopic(initialTopic);
        }
      });
    },
    [toast]
  );
  
  const handleSearch = () => {
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm && trimmedTerm !== currentTopic) {
      fetchIdeas(trimmedTerm);
    }
  };

  const handleFilterClick = (filter: string) => {
    if (filter !== currentTopic) {
      setSearchTerm(filter);
      fetchIdeas(filter);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const isLoading = isSearching && trendingIdeas.length === 0;

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
