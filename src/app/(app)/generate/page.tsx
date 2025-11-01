
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Wand2, Loader2, Book, Archive, FileText } from 'lucide-react';
import UnifiedProgressModal from '@/components/boss-os/unified-progress-modal';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import {
  GenerationConfigSchema,
  type GenerationConfig,
  type EbookContent,
} from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';

export default function GeneratePage() {
  const [generationConfig, setGenerationConfig] =
    useState<GenerationConfig | null>(null);
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
      authorName: "Boss User"
    },
  });

  const onSubmit = async (values: GenerationConfig) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    setGenerationConfig(values);
  };

  const handleGenerationComplete = (result: EbookContent) => {
    setProduct(result);
    setIsLoading(false);
    setGenerationConfig(null);
  };

  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setGenerationConfig(null);
  };
  
  const handleDownload = (format: 'md' | 'pdf' | 'docx' | 'zip') => {
    alert(`${format.toUpperCase()} download is not yet implemented.`);
  };


  return (
    <>
      {isLoading && generationConfig && (
        <UnifiedProgressModal
          config={generationConfig}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
          onClose={() => setIsLoading(false)}
        />
      )}

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="coverStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Style</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a cover style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Minimal">Minimal</SelectItem>
                            <SelectItem value="Premium Gradient">
                              Premium Gradient
                            </SelectItem>
                            <SelectItem value="Modern">Modern</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground pt-1">
                            Cover image will be generated automatically when your product is created.
                        </p>
                      </FormItem>
                    )}
                  />
                  {/* Other fields will go here */}
                </div>

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
              <CardDescription>
                {product.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <h3 className="text-lg font-semibold">Cover Preview</h3>
                {product.coverImageUrl && (
                    <div className="aspect-[3/4] w-full rounded-lg shadow-lg overflow-hidden">
                        <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                )}
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
                <h3 className="text-lg font-semibold mb-4">E-book Content ({product.estimated_pages} pages)</h3>
                 <Accordion type="single" collapsible className="w-full" defaultValue="chapter-0">
                    {product.chapters.map((chapter, index) => (
                      <AccordionItem key={index} value={`chapter-${index}`}>
                        <AccordionTrigger>{chapter.chapter_title}</AccordionTrigger>
                        <AccordionContent>
                          {chapter.sections.map((section, sIndex) => (
                            <div key={sIndex} className="prose prose-sm prose-invert max-w-none mb-4">
                              <h4 className="font-semibold">{section.heading}</h4>
                              <div dangerouslySetInnerHTML={{ __html: marked(section.content) }} />
                            </div>
                          ))}
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
