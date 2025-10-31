
'use client';

import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { ArrowRight, Book, Flame, Loader2, Search } from 'lucide-react';
import { useCollection } from '@/firebase';
import {
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface TrendingTopic {
  id: string;
  topic: string;
  usage_count: number;
}

function ProductSearchPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const trendingTopicsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'trending_topics'),
            orderBy('usage_count', 'desc')
          )
        : null,
    [firestore]
  );

  const {
    data: trendingTopics,
    isLoading,
    error,
  } = useCollection<TrendingTopic>(trendingTopicsQuery);
  
  const filteredTopics = trendingTopics?.filter(topic => 
    topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Book />
          Digital Product Ideas
        </h1>
        <p className="text-muted-foreground">
          Browse trending topics for e-books, courses, and guides.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search topics..."
          className="h-12 pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>


      {isLoading && (
        <div className="flex justify-center items-center h-48 flex-col gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading trending topics...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error Loading Topics</AlertTitle>
          <AlertDescription>
            Could not load trending topics. Please check your connection or try again later.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && filteredTopics && (
        <>
          {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((product) => (
                <Card key={product.id} className="glass-card flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{product.topic}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-amber-400">
                      <Flame className="h-4 w-4" />
                      {product.usage_count.toLocaleString()} creators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-0">
                    <p className="text-muted-foreground text-sm">
                      This topic is gaining traction. Explore it to create your next
                      hit product.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Explore Topic <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Topics Found</h3>
                <p className="text-muted-foreground mt-2">
                  {trendingTopics?.length === 0 
                    ? "It looks like no products have been generated yet. Be the first!"
                    : "Your search didn't match any topics. Try a different keyword."
                  }
                </p>
                {trendingTopics?.length === 0 && (
                   <Button variant="default" className="mt-4" asChild>
                    <a href="/generate">Generate a Product</a>
                  </Button>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DownloadsPage() {
  return <ProductSearchPage />;
}
