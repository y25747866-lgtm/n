
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Flame, Loader2, Search, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type Topic = {
  id: string;
  topic: string;
  usage_count?: number;
};

const defaultTopics: Omit<Topic, 'id'>[] = [
    { topic: "AI for Beginners" },
    { topic: "Passive Income Hacks" },
    { topic: "Digital Product Mastery" },
    { topic: "Self-Discipline Blueprint" },
    { topic: "Mindset Transformation" }
];

export default function DownloadsPage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || isUserLoading) return;

    setIsLoading(true);
    const trendingQuery = collection(firestore, 'trending_topics');

    const unsubscribe = onSnapshot(
      trendingQuery,
      (snapshot) => {
        if (snapshot.empty) {
            // If firestore is empty, use default topics
            const defaultData = defaultTopics.map((t, i) => ({ ...t, id: `default-${i}`}));
            setTopics(defaultData);
        } else {
            const fetchedTopics = snapshot.docs.map((doc) => ({
                id: doc.id,
                topic: doc.data().topic,
                usage_count: doc.data().usage_count,
            })) as Topic[];
            setTopics(fetchedTopics);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Firestore onSnapshot Error:', err);
        setError('Failed to load trending topics.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, isUserLoading]);

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return topics;
    return topics.filter((topic) =>
      topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, searchTerm]);

  const handleSelectTopic = (topic: Topic) => {
    router.push(`/generate?topic=${encodeURIComponent(topic.topic)}`);
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Hot Topics
        </h1>
        <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
          Explore trending e-book topics to inspire your next creation. Click a topic to get started.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a topic..."
          className="w-full pl-10 h-12 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {searchTerm
              ? `No topics found for "${searchTerm}".`
              : 'No trending topics yet. Create a product to see what\'s hot!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="glass-card flex flex-col justify-between cursor-pointer group hover:border-primary/50 transition-all"
              onClick={() => handleSelectTopic(topic)}
            >
              <CardHeader>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{topic.topic}</CardTitle>
              </CardHeader>
              <CardFooter className="flex items-center justify-between bg-black/10 p-3 backdrop-blur-sm mt-auto">
                 {topic.usage_count ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Flame className="h-4 w-4" />
                        <span>{topic.usage_count?.toLocaleString()} creators</span>
                    </div>
                ) : <div />}
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

