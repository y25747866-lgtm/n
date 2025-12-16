
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Loader2, Download, RefreshCw } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import { GenerationConfigSchema, type GenerationConfig, type EbookContent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLongEbookPDF } from '@/lib/pdf-generator';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generateEbookAction } from '@/app/actions/generate-ebook-action';

// A mock UUIDv4 function to replace a dedicated package
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEbook, setGeneratedEbook] = useState<EbookContent | null>(null);

  const { firestore, user } = useFirebase();

  const ebookForm = useForm<GenerationConfig>({
    resolver: zodResolver(GenerationConfigSchema),
    defaultValues: {
      topic: '',
      productType: 'Ebook',
    },
  });

  const onEbookSubmit = async (values: GenerationConfig) => {
    setError(null);
    setIsLoading(true);
    setGeneratedEbook(null);

    try {
      const result = await generateEbookAction(values.topic);

      if (!result.success || !result.ebook) {
        throw new Error(result.error || 'Failed to generate ebook content.');
      }
      
      setGeneratedEbook(result.ebook);

    } catch (e: any) {
      setError(`Failed to generate ebook: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async (productData: EbookContent, productType: 'Ebook') => {
    if (!firestore || !user) {
        setError("You must be logged in to save to history.");
        return;
    };
    
    const id = uuidv4();
    const historyRef = doc(firestore, 'users', user.uid, 'generatedProducts', id);

    const dataToSave = {
      ...productData,
      id,
      userId: user.uid,
      productType,
      generationDate: new Date().toISOString(),
    };

    try {
        await setDoc(historyRef, dataToSave);
    } catch (e: any) {
        console.error("Error saving to history:", e);
        setError("Could not save product to your history. You can still download it.");
    }
  }

  const handleDownloadEbook = async () => {
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
      
      await saveToHistory(generatedEbook, 'Ebook');

    } catch (e: any) {
        setError(`Failed to create PDF: ${e.message}`);
    }
  };
  
  const handleResetEbook = () => {
    setGeneratedEbook(null);
    ebookForm.reset();
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
      
      
        <Tabs defaultValue="ebook" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto">
            <TabsTrigger value="ebook">E-book</TabsTrigger>
            <TabsTrigger value="course" disabled>Course</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ebook">
             {generatedEbook ? (
                <Card className="glass-card animate-fade-in">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Your E-book is Ready!</CardTitle>
                        <CardDescription>Review your generated product below. Read the chapters, then download it as a PDF.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-8 items-start">
                          {/* Left Column: Cover */}
                          <div className="space-y-4">
                              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-2xl transition-transform hover:scale-105">
                                  <Image
                                    src={generatedEbook.coverImageUrl || ''}
                                    alt={generatedEbook.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="ebook cover"
                                  />
                              </div>
                              <div className="text-center">
                                  <h2 className="text-xl font-bold">{generatedEbook.title}</h2>
                                  <p className="text-muted-foreground text-md">{generatedEbook.subtitle}</p>
                              </div>
                          </div>

                          {/* Right Column: Content Preview */}
                          <div className="space-y-4">
                              <h3 className="text-xl font-semibold">Content Preview</h3>
                              <Accordion type="single" collapsible className="w-full max-h-[500px] overflow-y-auto pr-2">
                                {generatedEbook.chapters.map((chapter, index) => (
                                  <AccordionItem key={index} value={`chapter-${index}`}>
                                    <AccordionTrigger>{`Chapter ${index + 1}: ${chapter.title}`}</AccordionTrigger>
                                    <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                      {chapter.content}
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                                <AccordionItem value="conclusion">
                                  <AccordionTrigger>Conclusion</AccordionTrigger>
                                  <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                    {generatedEbook.conclusion}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                          </div>
                      </div>

                      <div className="flex justify-center gap-4 pt-4">
                          <Button onClick={handleDownloadEbook} size="lg" className="h-12 text-lg">
                              <Download />
                              <span className="ml-2">Download PDF</span>
                          </Button>
                          <Button onClick={handleResetEbook} size="lg" variant="outline" className="h-12 text-lg">
                              <RefreshCw />
                              <span className="ml-2">Generate Another</span>
                          </Button>
                      </div>
                    </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Generate a New E-book</CardTitle>
                    <CardDescription>Just enter a topic, and we'll handle the rest—title, chapters, content, and cover.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Form {...ebookForm}>
                      <form onSubmit={ebookForm.handleSubmit(onEbookSubmit)} className="space-y-6">
                        <FormField
                          control={ebookForm.control}
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
                          <span className="ml-2">{isLoading ? "Generating Your Masterpiece..." : "Generate Your Product"}</span>
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
            )}
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
      

      {error && <ErrorDisplay message={error} />}
    </div>
  );
}
