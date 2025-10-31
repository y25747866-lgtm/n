'use client';

import {
  Book,
  FileText,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quickActions = [
  {
    title: 'Generate a New Product',
    description: 'Create a new e-book or course from scratch.',
    icon: Book,
    href: '/generate',
  },
  {
    title: 'Explore Trending Products',
    description: 'See what digital products are currently popular.',
    icon: TrendingUp,
    href: '/downloads',
  },
  {
    title: 'Browse Templates',
    description: 'Find a new look for your next landing page or site.',
    icon: FileText,
    href: '/trending',
  },
  {
    title: 'Get Inspired',
    description: 'Discover new ideas and niches for digital products.',
    icon: Lightbulb,
    href: '/trending',
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl space-y-8">
      <header>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
          Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">Boss</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          This is your command center for creating and managing your digital empire.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link href={action.href} key={action.title}>
            <Card className="glass-card h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <action.icon className="h-6 w-6" />
                </div>
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Ready to Create?</CardTitle>
          <CardDescription>
            Start your journey by generating a new digital product. Let our AI do the heavy lifting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/generate">
            <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end text-white hover:opacity-90 transition-opacity">
              Generate Your First Product
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
