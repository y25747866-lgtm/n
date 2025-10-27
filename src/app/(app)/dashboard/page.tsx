
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/contexts/subscription-provider';
import { cn } from '@/lib/utils';
import { ArrowRight, BookOpen, Brush, Lightbulb, StepForward, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: BookOpen,
    title: 'Content Generation',
    description: 'Instantly generate high-quality ebooks, course scripts, and more.',
    gradient: 'from-accent-1-start to-accent-1-mid',
  },
  {
    icon: Brush,
    title: 'Cover Creation',
    description: 'Concurrently design stunning, professional covers for your digital products.',
    gradient: 'from-accent-1-mid to-accent-1-end',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'Discover viral product ideas and niches before they take off.',
    gradient: 'from-accent-2-mid to-accent-2-end',
  },
];

const howItWorks = [
  {
    icon: Lightbulb,
    step: 'Step 1',
    title: 'Choose Topic',
    description: 'Select a niche or use our AI to find trending ideas.',
  },
  {
    icon: 'GEN_ICON',
    step: 'Step 2',
    title: 'Generate',
    description: 'AI crafts your content and cover simultaneously.',
  },
  {
    icon: StepForward,
    step: 'Step 3',
    title: 'Launch',
    description: 'Download, sell, and build your digital empire.',
  },
];

export default function DashboardPage() {
  const { subscription, startSubscription, isLoading } = useSubscription();
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (subscription.status === 'unsubscribed') {
      router.push('/subscription');
    } else {
      router.push('/generate');
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-16 lg:space-y-24">
      <section className="mt-8 md:mt-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
          Boss OS: AI Digital Product Factory
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate ebooks, courses, covers, and trending digital assets instantly. Turn ideas into income streams with the power of AI.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end text-white hover:opacity-90 transition-opacity"
            onClick={handlePrimaryAction}
            disabled={isLoading}
          >
            {subscription.status === 'unsubscribed' ? 'Subscribe to Create' : 'Create New Product'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {features.map((feature, index) => (
          <Card key={index} className="glass-card text-left relative overflow-hidden">
            <div className={cn('absolute top-0 left-0 h-1 w-full bg-gradient-to-r', feature.gradient)}></div>
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2 bg-gradient-to-r from-accent-1-start to-accent-1-end text-transparent bg-clip-text" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="w-full max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
        <p className="mt-2 text-muted-foreground">Three simple steps to your next bestseller.</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden md:block"></div>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent -translate-y-1/2 hidden md:block"></div>
          {howItWorks.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center z-10">
              <div className="flex items-center justify-center w-16 h-16 rounded-full glass-card border-primary/50 border-2 bg-background mb-4">
                {step.icon === 'GEN_ICON' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end"></div>
                ) : (
                  <step.icon className="w-8 h-8 text-primary" />
                )}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.step}</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="w-full max-w-4xl">
        <Card className="glass-card">
           <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div>
                <h3 className="text-2xl font-bold">Ready to Build Your Empire?</h3>
                <p className="text-muted-foreground mt-2">Don't wait for inspiration. Generate it.</p>
              </div>
              <Link href="/generate">
                <Button size="lg" variant="secondary" className="px-6 py-5">
                  Start Generating Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
           </div>
        </Card>
      </section>
    </div>
  );
}
