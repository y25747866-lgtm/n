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
import { Sparkles, Wand2, Loader2, Book, FileText, Download } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import {
  GenerationConfigSchema,
  type GenerationConfig,
  type EbookContent,
} from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';
import Image from 'next/image';
import { downloadFile } from '@/lib/download';
import { generateGradientSVG } from '@/lib/svg-utils';


const placeholderProduct: EbookContent = {
    title: "The Art of Digital Creation",
    subtitle: "A guide to building your online empire.",
    chapters: [
        { title: "Chapter 1: Finding Your Niche", content: "This is the content for chapter 1. It's all about finding the perfect niche for your digital products." },
        { title: "Chapter 2: Creating Your First Product", content: "This is the content for chapter 2. We'll walk you through creating something amazing." },
        { title: "Chapter 3: Marketing and Sales", content: "This is the content for chapter 3. Learn how to get your product in front of the right people." },
    ],
    conclusion: "You now have the tools to succeed. Go out and create!",
    cover_image_prompt: "A minimalist digital art cover with abstract shapes and a modern color palette.",
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
    setError(null);
    setProduct(null);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
        const generatedProduct = {
            ...placeholderProduct,
            coverImageUrl: generateGradientSVG(placeholderProduct.title, placeholderProduct.subtitle)
        };
        setProduct(generatedProduct);
        setIsLoading(false);
    }, 2000);
  };
  
  
  const handleDownloadPDF = async () => {
    // PDF generation is temporarily disabled.
    alert("PDF download functionality is coming soon!");
  };
  
  const handleDownloadMarkdown = () => {
    if (!product) return;
    let mdContent = `# ${product.title}\n\n## ${product.subtitle}\n\n`;
    product.chapters.forEach(chapter => {
      mdContent += `### ${chapter.title}\n\n${chapter.content}\n\n`;
    });
    if (product.conclusion) {
      mdContent += `### Conclusion\n\n${product.conclusion}\n\n`;
    }
    downloadFile(mdContent, `${product.title.replace(/\s+/g, '_')}.md`, 'text/markdown');
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
                
                {product.coverImageUrl && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Generated Cover</h3>
                    <div className="aspect-[3/4] relative w-full overflow-hidden rounded-md border">
                        <Image
                            src={product.coverImageUrl}
                            alt={`Cover for ${product.title}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Downloads</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadMarkdown}
                      disabled={isLoading}
                    >
                      <FileText /> Markdown
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadPDF}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <Download />}
                      PDF
                    </Button>
                  </div>
                </div>
                 <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Cover Prompt</h3>
                  <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">{product.cover_image_prompt}</p>
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
                    {product.conclusion && (
                        <AccordionItem value="conclusion">
                            <AccordionTrigger>Conclusion</AccordionTrigger>
                            <AccordionContent>
                                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked(product.conclusion) }} />
                            </AccordionContent>
                        </AccordionItem>
                    )}
                  </Accordion>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
