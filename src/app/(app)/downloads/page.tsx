
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useAuth, useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { Flame, Loader2, Search } from 'lucide-react';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const gradientStops = [
  'from-red-500 to-yellow-500',
  'from-green-400 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-rose-400 to-red-500',
  'from-lime-400 to-green-500',
];

export default function DownloadsPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      signInAnonymously(auth).catch((err) => console.error('Anon sign-in error:', err));
    }
  }, [isUserLoading, user, auth]);

  const trendingQuery = useMemoFirebase(() => {
    if (isUserLoading || !user) return null;
    return query(
      collection(firestore, 'trending_topics'),
      orderBy('usage_count', 'desc'),
      limit(50)
    );
  }, [isUserLoading, user, firestore]);

  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useCollection(trendingQuery);

  const filteredTopics = useMemo(() => {
    if (!trendingData) return [];
    if (!searchTerm) return trendingData;
    return trendingData.filter(topic =>
      topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trendingData, searchTerm]);

  const isLoading = isUserLoading || trendingLoading;

  if (trendingError) {
    console.error('Firestore Error:', trendingError);
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive text-lg">
          Failed to load trending topics. Please try again later.
        </p>
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
          Explore trending e-book topics to inspire your next creation.
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
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {searchTerm ? `No topics found for "${searchTerm}".` : 'No trending topics yet. Create a product to see what\'s hot!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic, index) => (
            <Card
              key={topic.id}
              className={`relative flex flex-col overflow-hidden text-white bg-gradient-to-br ${gradientStops[index % gradientStops.length]}`}
            >
              <CardHeader className="flex-1">
                <CardTitle className="text-2xl font-bold">
                  {topic.topic}
                </CardTitle>
              </CardHeader>
              <CardFooter className="z-10 flex items-center justify-between bg-black/20 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Flame className="h-4 w-4" />
                  <span>{topic.usage_count?.toLocaleString() || 0} creators</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
