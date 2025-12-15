
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
import { Sparkles, Wand2, Loader2, Book, Archive, FileText, Download } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import {
  GenerationConfigSchema,
  type GenerationConfig,
  type EbookContent,
} from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { marked } from 'marked';
import UnifiedProgressModal from '@/components/boss-os/unified-progress-modal';
import Image from 'next/image';
import { downloadFile } from '@/lib/download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function GeneratePage() {
  const [product, setProduct] = useState<EbookContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig | null>(null);


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

  const onSubmit = (values: GenerationConfig) => {
    setError(null);
    setProduct(null);
    setGenerationConfig(values);
    setShowProgressModal(true);
  };
  
   const handleGenerationComplete = (result: EbookContent) => {
    setProduct(result);
    setShowProgressModal(false);
    setIsLoading(false);
  };

  const handleGenerationError = (error: string) => {
    setError(error);
    setShowProgressModal(false);
    setIsLoading(false);
  };
  
  const handleDownloadPDF = async () => {
    if (!product) return;
    setIsLoading(true);

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    // Create a hidden element to render the book content for PDF generation
    const printableArea = document.createElement('div');
    printableArea.style.position = 'absolute';
    printableArea.style.left = '-9999px';
    printableArea.style.width = '595px'; // A4 width in points
    printableArea.style.padding = '40px';
    printableArea.className = 'prose prose-sm';

    let contentHtml = `<h1>${product.title}</h1><h2>${product.subtitle}</h2>`;
    product.chapters.forEach(chapter => {
      contentHtml += `<h3>${chapter.title}</h3>${marked(chapter.content)}`;
    });
     if (product.conclusion) {
      contentHtml += `<h3>Conclusion</h3>${marked(product.conclusion)}`;
    }
    printableArea.innerHTML = contentHtml;
    document.body.appendChild(printableArea);

    try {
      const canvas = await html2canvas(printableArea, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 595.28;
      const pageHeight = 841.89;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      doc.save(`${product.title.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error("Error generating PDF:", e);
      setError("Could not generate PDF. Please try again.");
    } finally {
      document.body.removeChild(printableArea);
      setIsLoading(false);
    }
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
      {showProgressModal && generationConfig && (
        <UnifiedProgressModal
          config={generationConfig}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
          onClose={() => setShowProgressModal(false)}
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
