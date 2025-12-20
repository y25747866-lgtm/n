'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { marked } from 'marked';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { generateReportAction } from '@/app/actions/generate-report-action';
import { ErrorDisplay } from '@/components/boss-os/error-display';

const formSchema = z.object({
  topic: z.string().min(10, {
    message: 'Please enter a topic with at least 10 characters.',
  }),
});

interface GeneratedContent {
  content?: string | null;
}

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await generateReportAction(values.topic);
      if (result.content) {
        setGeneratedContent(result);
      } else {
        setError('The AI returned an empty response.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-primary" />
          <span className="bg-clip-text text-transparent bg-accent-gradient-1">Report Creation System</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter a topic and let our AI create a detailed article for you.
        </p>
      </header>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Create a new Report</CardTitle>
          <CardDescription>
            Describe the topic you want to write about. Be as specific as you can.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A detailed guide on how to start a successful podcast for beginners in 2025'"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Report'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && <ErrorDisplay message={error} />}

      {generatedContent && generatedContent.content && (
        <Card className="glass-card fade-in">
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              className="prose prose-sm md:prose-base prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(generatedContent.content) }} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
