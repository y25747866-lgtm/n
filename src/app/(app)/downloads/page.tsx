
'use client';

import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { ArrowRight, Book, Flame, Loader2 } from 'lucide-react';
import { useCollection } from '@/firebase';
import {
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TrendingTopic {
  id: string;
  topic: string;
  usage_count: number;
}

function ProductSearchPage() {
  const firestore = useFirestore();

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

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load trending topics. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTopics?.map((product) => (
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
      )}
    </div>
  );
}

export default function DownloadsPage() {
  return <ProductSearchPage />;
}
