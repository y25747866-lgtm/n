
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { Flame, Search, Sparkles, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

type Topic = {
  id: string;
  topic: string;
  category?: string;
  usage_count?: number;
};

const defaultTopics: Omit<Topic, 'id'>[] = [
  { topic: 'AI for Beginners', category: 'Tech' },
  { topic: 'Passive Income Hacks', category: 'Business' },
  { topic: 'Digital Product Mastery', category: 'Business' },
  { topic: 'Self-Discipline Blueprint', category: 'Personal Development' },
  { topic: 'Mindset Transformation', category: 'Personal Development' },
  { topic: 'Fitness Over 40', category: 'Health' },
];

const categories = ['All', 'Tech', 'Business', 'Health', 'Personal Development'];

export default function DownloadsPage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || isUserLoading) return;

    const topicsQuery = collection(firestore, 'trending_topics');

    const unsubscribe = onSnapshot(
      topicsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          const defaultData = defaultTopics.map((t, i) => ({ ...t, id: `default-${i}` }));
          setTopics(defaultData);
        } else {
          const fetchedTopics = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Topic, 'id'>),
          }));
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
    return topics.filter((topic) => {
      const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
      const matchesSearch =
        searchTerm === '' || topic.topic.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [topics, searchTerm, selectedCategory]);

  const handleSelectTopic = (topic: Topic) => {
    router.push(`/generate?topic=${encodeURIComponent(topic.topic)}`);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Hot Topics
        </h1>
        <p className="text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
          Explore trending e-book topics and templates to inspire your next creation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Search E-Book Topics</h2>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for a topic like 'AI' or 'Health'..."
              className="w-full pl-10 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Search Templates</h2>
          <div className="relative flex-1">
            <LayoutTemplate className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Template search is coming soon..."
              className="w-full pl-10 h-12 text-base"
              value={templateSearchTerm}
              onChange={(e) => setTemplateSearchTerm(e.target.value)}
              disabled
            />
          </div>
        </div>
      </div>
      
      <Separator />

      <div>
        <div className="flex justify-center mb-8">
          <ToggleGroup
            type="single"
            defaultValue="All"
            value={selectedCategory}
            onValueChange={(value) => value && setSelectedCategory(value)}
            className="flex-wrap justify-center"
          >
            {categories.map((category) => (
              <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`}>
                {category}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
              No topics found for the selected criteria. Try a different search or category!
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
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {topic.topic}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex items-center justify-between bg-black/10 p-3 backdrop-blur-sm mt-auto">
                  {topic.usage_count ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span>{topic.usage_count?.toLocaleString()} creators</span>
                    </div>
                  ) : (
                    <div />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
