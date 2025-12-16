'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import {
  GenerationConfigSchema,
  type GenerationConfig,
} from '@/lib/types';


export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GenerationConfig>({
    resolver: zodResolver(GenerationConfigSchema),
    defaultValues: {
      topic: '',
      productType: 'Ebook',
      tone: 'Casual',
      length: 'Short',
      coverStyle: 'Minimal',
      authorName: "User"
    },
  });

  const onSubmit = async (values: GenerationConfig) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-ebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: values.topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle the PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${values.topic.slice(0, 20).replace(/\s+/g, '_')}_ebook.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (e: any) {
      setError(`Failed to generate ebook: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <div className="container mx-auto max-w-5xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
            <Wand2 className="h-10 w-10 text-primary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
              Digital Product Factory
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter a topic and let our AI factory generate a complete e-book and a unique
            cover, ready for you to launch.
          </p>
        </header>

        <Card className="glass-card">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Idea</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 'Beginner's guide to investing in cryptocurrency'"
                          className="h-12 text-base"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  <span className="ml-2">Generate & Download PDF</span>
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && <ErrorDisplay message={error} />}

      </div>
    </>
  );
}
