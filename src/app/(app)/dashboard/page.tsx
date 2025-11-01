
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Book, Image as ImageIcon, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    title: 'E-book Content Generation',
    description: 'Instantly generate complete e-books, from title to conclusion, based on a single topic.',
    icon: Book,
    imageId: 'feature-ebook',
  },
  {
    title: 'AI Cover Creation',
    description: 'Create unique, professional cover art for your digital products in a variety of styles.',
    icon: ImageIcon,
    imageId: 'feature-cover',
  },
  {
    title: 'Discover Trending Ideas',
    description: 'Analyze real-time data to find trending topics and ensure your next product is a hit.',
    icon: TrendingUp,
    imageId: 'feature-trends',
  },
];


export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="max-w-4xl space-y-8">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
                Welcome to Boss OS
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl mt-2">
                Your AI-Powered Digital Product Factory
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {features.map(feature => {
                const image = PlaceHolderImages.find(p => p.id === feature.imageId);
                return (
                    <Card key={feature.title} className="glass-card flex flex-col">
                        <CardHeader>
                            <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                {image && (
                                    <Image src={image.imageUrl} alt={feature.title} className="object-cover" fill data-ai-hint={image.imageHint} />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col">
                           <h3 className="font-semibold text-lg flex items-center gap-2">
                                <feature.icon className="h-5 w-5 text-primary" />
                                {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2 flex-1">
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>

        <Link href="/generate">
          <Button size="lg" className="h-12 px-8 text-lg animate-pulse">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

