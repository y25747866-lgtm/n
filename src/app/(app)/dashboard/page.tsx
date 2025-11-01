
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BookOpenCheck, Image as ImageIcon, Sparkles, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: BookOpenCheck,
    title: 'E-book Content Generation',
    description: 'Instantly generate complete e-books, from title to conclusion, based on a single topic.',
    image: PlaceHolderImages.find(p => p.id === 'feature-ebook')
  },
  {
    icon: ImageIcon,
    title: 'AI Cover Creation',
    description: 'Create unique, professional cover art for your digital products concurrently with content generation.',
    image: PlaceHolderImages.find(p => p.id === 'feature-cover')
  },
  {
    icon: TrendingUp,
    title: 'Discover Hot Trends',
    description: 'Analyze real-time data to find trending topics and capitalize on market demand.',
    image: PlaceHolderImages.find(p => p.id === 'feature-trends')
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-16">
      <div className="flex flex-col items-center text-center">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
              Your Trend Dashboard Awaits
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              The magic begins when you create! Generate your first e-book, and
              this page will fill with trending topics.
            </p>
          </div>

          <Link href="/generate">
            <Button size="lg" className="h-12 px-8 text-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Unlock Your Creative Empire</h2>
            <p className="mt-2 text-muted-foreground">Everything you need to build and sell digital products.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="glass-card flex flex-col">
              <CardHeader>
                {feature.image && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <Image 
                      src={feature.image.imageUrl} 
                      alt={feature.title}
                      fill
                      className="object-cover"
                      data-ai-hint={feature.image.imageHint}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
