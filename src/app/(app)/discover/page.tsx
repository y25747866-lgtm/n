
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type Topic = {
  id: string;
  title: string;
  trend_score: number;
  keywords: string[];
  last_updated: string; // ISO string
};

function TopicCard({ topic, index }: { topic: Topic; index: number }) {
    const growth = Math.floor(Math.random() * 50) - 10;
    const growthText = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    const lastUpdated = topic.last_updated ? formatDistanceToNow(new Date(topic.last_updated), { addSuffix: true }) : 'N/A';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="glass-card flex h-full flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription>Last updated: {lastUpdated}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                     <p className="text-3xl font-bold text-primary">{topic.trend_score || 0}</p>
                     <p className="text-xs text-muted-foreground">Trend Score</p>
                </CardContent>
                <CardFooter className="flex-wrap gap-1">
                    {topic.keywords?.slice(0, 3).map((kw) => (
                        <Badge key={kw} variant="secondary">{kw}</Badge>
                    ))}
                </CardFooter>
            </Card>
        </motion.div>
    );
}

export default function DiscoverPage() {
  const { firestore } = useFirebase();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const topicsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, "trending_topics"),
        orderBy("trend_score", "desc"),
        limit(50)
    );
  }, [firestore]);

  const { data: allTopics, isLoading, error } = useCollection<Topic>(topicsQuery);

  // Suggestion logic
  useEffect(() => {
    if (!search.trim() || !allTopics) {
      setSuggestions([]);
      return;
    }
    const lowerSearch = search.toLowerCase();
    const matched = allTopics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(lowerSearch) ||
        (topic.keywords && topic.keywords.some((kw) => kw.toLowerCase().includes(lowerSearch)))
    ).slice(0, 5);
    setSuggestions(matched);
  }, [search, allTopics]);

  const handleSelectSuggestion = (topic: Topic) => {
    setSelectedTopic(topic);
    setSearch(topic.title);
    setSuggestions([]);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      if(selectedTopic) {
          setSelectedTopic(null);
      }
  }

  const filteredTopics = useMemo(() => {
    if (!allTopics) return [];
    if (selectedTopic) return [selectedTopic];
    if (!search.trim()) return allTopics;
    
    const lowerSearch = search.toLowerCase();
    return allTopics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(lowerSearch) ||
          (topic.keywords && topic.keywords.some((kw) => kw.toLowerCase().includes(lowerSearch)))
      );
  }, [allTopics, search, selectedTopic]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching live trends from the database...</p>
        </div>
      );
    }

    if (error) {
       return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h3 className="text-xl font-semibold">Could not load trends</h3>
            <p className="text-muted-foreground max-w-md">There was a problem fetching data from Firestore. Please check the console for details.</p>
          </CardContent>
        </Card>
      );
    }
    
    if (filteredTopics.length === 0 && search) {
      return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Trends Found</h3>
            <p className="text-muted-foreground max-w-md">
              Your search for "{search}" didn't match any topics. Try a different keyword.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (filteredTopics.length === 0 && !search) {
      return (
        <Card className="glass-card">
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Trends Available</h3>
            <p className="text-muted-foreground max-w-md">
              It looks like the trending topics haven't been synced yet. Please deploy the Firebase Function to populate this data.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic, index) => (
           <TopicCard key={topic.id} topic={topic} index={index} />
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
          Explore real-time data to find your next digital product idea.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="search"
          type="search"
          placeholder="Search for a topic like 'AI', 'Health', or 'Finance'..."
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-10 h-12 text-base"
          disabled={isLoading && !allTopics}
        />
        {suggestions.length > 0 && (
          <Card className="absolute top-full mt-2 w-full z-10 glass-card">
            <CardContent className="p-2">
                <ul>
                    {suggestions.map(topic => (
                        <li key={topic.id}>
                            <button className="w-full text-left p-2 rounded-md hover:bg-accent flex items-center gap-2" onClick={() => handleSelectSuggestion(topic)}>
                               <Lightbulb className="h-4 w-4 text-primary" />
                               <span>{topic.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {renderContent()}
    </div>
  );
}

