
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Book,
  Archive,
  FileText,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { createDigitalProduct } from '@/ai/flows/create-digital-product-flow';
import { type DigitalProduct, TopicSchema } from '@/lib/types';
import { downloadFile } from '@/lib/download';
import Header from '@/components/boss-os/header';
import { ErrorDisplay } from '@/components/boss-os/error-display';

export default function GeneratePage() {
  const [product, setProduct] = useState<DigitalProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof TopicSchema>>({
    resolver: zodResolver(TopicSchema),
    defaultValues: {
      topic: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof TopicSchema>) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);

    try {
      const result = await createDigitalProduct(values);
      setProduct(result);
    } catch (e: any) {
      console.error(e);
      // Check for API key expiry/invalidity
      if (e.message?.includes('API key')) {
        setError("Temporary maintenance — Boss OS Premium update in progress. Please try again later.");
      } else {
        setError(e.message || 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'md' | 'pdf' | 'docx' | 'zip') => {
    if (!product) return;

    if (format === 'md') {
      const fullContent = `
# ${product.title}

## Introduction
${product.introduction}

${product.chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n')}

## Conclusion
${product.conclusion}

### Call to Action
${product.callToAction}
      `.trim();
      downloadFile(fullContent, `${product.title.replace(/\s+/g, '_')}.md`, 'text/markdown');
    } else {
      // Placeholder for other formats
      alert(`${format.toUpperCase()} download is not yet implemented.`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-5xl space-y-8">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
              <Wand2 className="h-10 w-10 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
                Digital Product Factory
              </span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Enter a topic and let AI generate a complete e-book and a unique cover in a single click.
            </p>
          </header>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="sr-only">Topic</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 'A beginner's guide to investing in cryptocurrency'"
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
                    className="w-full sm:w-auto h-12 text-lg flex-shrink-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    <span className="ml-2">Generate</span>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">AI is building your product... this may take a moment.</p>
            </div>
          )}

          {error && <ErrorDisplay message={error} />}

          {product && (
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle>Your Digital Product is Ready</CardTitle>
                <CardDescription>Review your generated e-book and cover below.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <h3 className="text-lg font-semibold">Cover Preview</h3>
                  <div
                    className="aspect-[3/4] w-full rounded-lg shadow-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: product.coverSvg }}
                  />
                  <div className="space-y-2">
                     <h3 className="text-lg font-semibold">Downloads</h3>
                     <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => handleDownload('md')}>
                           <FileText /> Markdown
                        </Button>
                         <Button variant="outline" onClick={() => handleDownload('zip')} disabled>
                           <Archive /> ZIP
                        </Button>
                         <Button variant="outline" onClick={() => handleDownload('pdf')} disabled>
                           <Book /> PDF
                        </Button>
                         <Button variant="outline" onClick={() => handleDownload('docx')} disabled>
                           <FileText /> DOCX
                        </Button>
                     </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">E-book Content</h3>
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                     <AccordionItem value="item-0">
                        <AccordionTrigger>Introduction</AccordionTrigger>
                        <AccordionContent>
                           <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.introduction }} />
                        </AccordionContent>
                     </AccordionItem>
                    {product.chapters.map((chapter, index) => (
                      <AccordionItem key={index} value={`item-${index + 1}`}>
                        <AccordionTrigger>{`Chapter ${index + 1}: ${chapter.title}`}</AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: chapter.content }} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                     <AccordionItem value={`item-${product.chapters.length + 1}`}>
                        <AccordionTrigger>Conclusion & Call to Action</AccordionTrigger>
                        <AccordionContent>
                           <div className="prose prose-sm prose-invert max-w-none">
                              <h4>Conclusion</h4>
                              <div dangerouslySetInnerHTML={{ __html: product.conclusion }} />
                              <h4 className="mt-4">Call to Action</h4>
                              <div dangerouslySetInnerHTML={{ __html: product.callToAction }} />
                           </div>
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
