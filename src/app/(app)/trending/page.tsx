
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, BarChart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useState, useTransition, useEffect, Suspense, useCallback } from "react";
import { suggestTrendingIdeas, SuggestTrendingIdeasOutput } from "@/ai/flows/suggest-trending-ideas";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const filters = ["Amazon PLR", "Etsy Digital", "Udemy", "Google Trends", "Future Prediction"];

// In-memory cache using a Map, defined at the module level to persist across re-renders and navigations.
const ideasCache = new Map<string, SuggestTrendingIdeasOutput['ideas']>();

function TrendingIdeasPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSearching, startSearchTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingIdeas, setTrendingIdeas] = useState<SuggestTrendingIdeasOutput['ideas']>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('trending digital products');

  const handleUseTrend = (topic: string) => {
    router.push(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  const fetchIdeas = useCallback((topic: string) => {
    setCurrentTopic(topic);
    if (ideasCache.has(topic)) {
      setTrendingIdeas(ideasCache.get(topic)!);
      return;
    }

    setTrendingIdeas([]); // Clear old ideas to show skeleton
    startSearchTransition(async () => {
      try {
        const result = await suggestTrendingIdeas({ topic });
        const ideas = result.ideas;
        ideasCache.set(topic, ideas);
        setTrendingIdeas(ideas);
      } catch (error) {
        console.error("Failed to fetch trending ideas:", error);
        toast({
          title: "Temporary Maintenance",
          description: "Boss OS Premium update in progress. Please try again later.",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  useEffect(() => {
    // Fetch ideas for the current topic on initial load or when topic changes
    fetchIdeas(currentTopic);
  }, [currentTopic, fetchIdeas]);


  const handleSearch = () => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      return;
    }
    fetchIdeas(trimmedTerm);
  };

  const handleFilterClick = (filter: string) => {
    setSearchTerm(filter);
    fetchIdeas(filter);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  
  const isLoading = isSearching || (trendingIdeas.length === 0 && !ideasCache.has(currentTopic));

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
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <Button
              key={filter}
              variant="outline"
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
