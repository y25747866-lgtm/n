
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

export default function GeneratePage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-primary" />
          <span className="bg-clip-text text-transparent bg-accent-gradient-1">Digital Product Factory</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Turn your ideas into market-ready digital products in minutes. Describe your topic, and let our AI handle the rest.
        </p>
      </header>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Generation Temporarily Disabled</CardTitle>
          <CardDescription>
            We are working to resolve a dependency issue with the AI generation feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Where did the e-book generator button go that lets people create e-books? If you removed it, why bring everything back?Where did the e-book generator button go that lets people create e-books? If you removed it, why bring everything back?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
