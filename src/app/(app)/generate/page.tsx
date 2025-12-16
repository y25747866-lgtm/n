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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Loader2, Download, RefreshCw } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import { GenerationConfigSchema, type GenerationConfig, type EbookContent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLongEbookPDF } from '@/lib/pdf-generator';
import Image from 'next/image';
import { generateGradientSVG } from '@/lib/svg-utils';

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEbook, setGeneratedEbook] = useState<EbookContent | null>(null);

  const form = useForm<GenerationConfig>({
    resolver: zodResolver(GenerationConfigSchema),
    defaultValues: {
      topic: '',
      productType: 'Ebook',
    },
  });

  const onSubmit = async (values: GenerationConfig) => {
    setError(null);
    setIsLoading(true);
    setGeneratedEbook(null);

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
      
      const ebookData: EbookContent = await response.json();
      
      // Generate a placeholder cover
      const coverImage = generateGradientSVG(ebookData.title, ebookData.subtitle || '');
      
      setGeneratedEbook({
        ...ebookData,
        coverImageUrl: coverImage,
      });

    } catch (e: any) {
      setError(`Failed to generate ebook: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!generatedEbook) return;

    try {
      const pdfBytes = await generateLongEbookPDF(
        generatedEbook.title,
        generatedEbook.chapters,
        generatedEbook.conclusion
      );
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedEbook.title.slice(0, 20).replace(/\s+/g, '_')}_ebook.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
        setError(`Failed to create PDF: ${e.message}`);
    }
  };
  
  const handleReset = () => {
    setGeneratedEbook(null);
    form.reset();
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-primary" />
          <span className="bg-clip-text text-transparent bg-accent-gradient-1">
            Digital Product Factory
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter a topic and let our AI factory generate a complete digital product and a unique cover, ready for you to launch.
        </p>
      </header>
      
      {generatedEbook ? (
        <Card className="glass-card text-center animate-fade-in">
            <CardHeader>
                <CardTitle className="text-2xl">Your Product is Ready!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
                <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
                    <Image
                      src={generatedEbook.coverImageUrl || ''}
                      alt={generatedEbook.title}
                      fill
                      className="object-cover"
                      data-ai-hint="ebook cover"
                    />
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{generatedEbook.title}</h2>
                    <p className="text-muted-foreground">{generatedEbook.subtitle}</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleDownload} size="lg" className="h-12 text-lg">
                        <Download />
                        <span className="ml-2">Download PDF</span>
                    </Button>
                    <Button onClick={handleReset} size="lg" variant="outline" className="h-12 text-lg">
                        <RefreshCw />
                        <span className="ml-2">Generate Another</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="ebook" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="ebook">E-book</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
            <TabsTrigger value="template" disabled>Template</TabsTrigger>
          </TabsList>
          <TabsContent value="ebook">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Generate a New E-book</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Topic Idea</FormLabel>
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
                    <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                      <span className="ml-2">Generate Your Product</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="course">
              <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Course Generator</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Course generation is coming soon! Stay tuned.</p>
                </CardContent>
              </Card>
           </TabsContent>
        </Tabs>
      )}

      {error && <ErrorDisplay message={error} />}
    </div>
  );
}
