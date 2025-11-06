
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type Topic = {
  id: string;
  topic: string;
  usage_count: number;
  last_month_usage_count: number;
  keywords?: string[];
};

export default function DiscoverPage() {
  const { firestore } = useFirebase();
  const [search, setSearch] = useState('');
  
  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'trending_topics'), orderBy('usage_count', 'desc'));
  }, [firestore]);

  const { data: topics } = useCollection<Topic>(topicsQuery as any);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!search.trim()) {
      return topics;
    }

    const query = search.toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);

    const results = topics.filter((topic) => {
      const title = (topic.topic || '').toLowerCase();
      const keywords = (topic.keywords || []).join(' ').toLowerCase();
      return words.every(
        (word) => title.includes(word) || keywords.includes(word)
      );
    });

    return results.length > 0 ? results : topics.slice(0, 5);
  }, [search, topics]);

  return (
    <div className="p-6">
      <div className="space-y-4 text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Discover Trending Topics
        </h1>
      </div>
      
      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search trending topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full pl-10 h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-4 rounded-xl border border-border/50 backdrop-blur-lg bg-card/50 hover:bg-accent/50 transition-all"
          >
            <h2 className="text-lg font-medium mb-1">{topic.topic}</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {Array.isArray(topic.keywords)
                ? topic.keywords.join(', ')
                : 'No keywords'}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-semibold">
                ↑ {topic.usage_count || 0} users this month
              </span>
              {topic.last_month_usage_count !== undefined && (
                <span className="text-xs text-blue-400">
                  Δ{' '}
                  {(
                    (((topic.usage_count || 0) -
                      (topic.last_month_usage_count || 0)) /
                      Math.max(topic.last_month_usage_count || 1, 1)) * 100
                  ).toFixed(0)}
                  %
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <p className="mt-6 text-center text-muted-foreground">
          No topics found. Try another keyword.
        </p>
      )}
    </div>
  );
}
