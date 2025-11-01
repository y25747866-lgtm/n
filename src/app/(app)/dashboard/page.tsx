
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
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
  );
}
