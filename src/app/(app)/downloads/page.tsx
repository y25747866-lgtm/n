
'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Flame,
  LayoutTemplate,
  Loader2,
  Search,
  Book,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

interface TrendingTopic {
  id: string;
  topic: string;
  usage_count: number;
}

const templates = [
  {
    title: 'Minimalist Portfolio',
    description: 'A clean and modern portfolio template for creatives.',
  },
  {
    title: 'SaaS Landing Page',
    description: 'High-converting landing page for software products.',
  },
  {
    title: 'Digital Product Storefront',
    description: 'A sleek storefront to sell your digital goods.',
  },
  {
    title: 'Agency Website',
    description: 'Professional template for digital agencies and freelancers.',
  },
  {
    title: 'Blog & Newsletter',
    description: 'Content-focused template for writers and creators.',
  },
  {
    title: 'Personal Website',
    description: 'A stylish personal site to build your brand.',
  },
];

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

function DigitalProductSearch() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const trendingTopicsQuery = useMemoFirebase(
    () =>
      firestore && !isUserLoading
        ? query(
            collection(firestore, 'trending_topics'),
            orderBy('usage_count', 'desc'),
            orderBy('lastUpdated', 'desc'),
            limit(12)
          )
        : null,
    [firestore, isUserLoading]
  );

  const {
    data: trendingTopics,
    isLoading: isTopicsLoading,
    error,
  } = useCollection<TrendingTopic>(trendingTopicsQuery);

  const filteredTopics = trendingTopics?.filter((topic) =>
    topic.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasTopics = trendingTopics && trendingTopics.length > 0;
  const hasFilteredTopics = filteredTopics && filteredTopics.length > 0;

  if (isTopicsLoading || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Trends</AlertTitle>
        <AlertDescription>
          Could not load trending topics. Please check your connection or try
          again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasTopics) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-4">
        <Sparkles className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold">
          No trends yet — create the first product!
        </h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Create your first product to activate your trend dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search topics..."
          className="h-12 w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {hasFilteredTopics ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <span>{topic.usage_count.toLocaleString()} creators used this</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No results found. Try another keyword.
          </p>
        </div>
      )}
    </div>
  );
}

function TemplateSearch() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search for a template..."
          className="h-12 w-full pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Card key={index} className="glass-card flex flex-col">
            <CardHeader>
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                <Image
                  src={`https://picsum.photos/seed/${index + 20}/600/400`}
                  alt={template.title}
                  fill
                  className="object-cover"
                  data-ai-hint="website template"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {template.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                View Template <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="digital-product">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="digital-product">
            <Book className="mr-2 h-4 w-4" />
            Digital Product Search
          </TabsTrigger>
          <TabsTrigger value="template-search">
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Template Search
          </TabsTrigger>
        </TabsList>
        <TabsContent value="digital-product">
          <DigitalProductSearch />
        </TabsContent>
        <TabsContent value="template-search">
          <TemplateSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
