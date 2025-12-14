
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sparkles, Wand2, Loader2, Book, Archive, FileText } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import {
  GenerationConfigSchema,
  type GenerationConfig,
  type EbookContent,
} from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';

const placeholderEbook: EbookContent = {
    title: "Placeholder E-book Title",
    subtitle: "A subtitle for your generated book.",
    chapters: [
        {
            title: "Chapter 1: The Beginning",
            content: "This is the content for the first chapter. It's generated as a placeholder because the real API is currently disabled."
        },
        {
            title: "Chapter 2: The Middle",
            content: "Here is some more placeholder content for the second chapter of the book."
        }
    ],
    conclusion: "This is the conclusion of the placeholder e-book.",
    cover_prompt: "A minimal cover with geometric shapes"
};

export default function GeneratePage() {
  const [product, setProduct] = useState<EbookContent | null>(null);
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
    setIsLoading(true);
    setError(null);
    setProduct(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // The original API call is commented out to prevent the error.
      // We now use placeholder data instead.
      // const response = await fetch('/api/generate-ebook', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ topic: values.topic }),
      // });

      // if (!response.ok) {
      //   const errorText = await response.text();
      //   throw new Error(`Failed to generate ebook: ${errorText}`);
      // }

      // const data = await response.json();
      // const ebookContent = JSON.parse(data.ebook);
      
      setProduct(placeholderEbook);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (format: 'md' | 'pdf' | 'docx' | 'zip') => {
    alert(`${format.toUpperCase()} download is not yet implemented.`);
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
            Enter a topic and let AI generate a complete e-book and a unique
            cover, tailored to your style.
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
                          placeholder="Enter your topic idea or keyword"
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
                  <span className="ml-2">Generate Your First Product</span>
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && <ErrorDisplay message={error} />}

        {product && (
          <Card className="glass-card animate-fade-in">
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Downloads</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('md')}
                    >
                      <FileText /> Markdown
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('zip')}
                      disabled
                    >
                      <Archive /> ZIP
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('pdf')}
                      disabled
                    >
                      <Book /> PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload('docx')}
                      disabled
                    >
                      <FileText /> DOCX
                    </Button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">E-book Content</h3>
                 <Accordion type="single" collapsible className="w-full" defaultValue="chapter-0">
                    {product.chapters.map((chapter, index) => (
                      <AccordionItem key={index} value={`chapter-${index}`}>
                        <AccordionTrigger>{chapter.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked(chapter.content) }} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
