
'use client';

import { useState } from 'react';
import { useForm, useForm as useTemplateForm } from 'react-hook-form';
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
import { Sparkles, Wand2, Loader2, Download, RefreshCw, BookOpen, FileText } from 'lucide-react';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import { GenerationConfigSchema, type GenerationConfig, type EbookContent, TemplateGenerationConfigSchema, TemplateGenerationConfig, TemplateContent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLongEbookPDF } from '@/lib/pdf-generator';
import Image from 'next/image';
import { generateGradientSVG } from '@/lib/svg-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadFile } from '@/lib/download';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEbook, setGeneratedEbook] = useState<EbookContent | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<TemplateContent | null>(null);
  const { firestore, user } = useFirebase();

  const ebookForm = useForm<GenerationConfig>({
    resolver: zodResolver(GenerationConfigSchema),
    defaultValues: {
      topic: '',
      productType: 'Ebook',
      category: 'business',
    },
  });

  const templateForm = useTemplateForm<TemplateGenerationConfig>({
    resolver: zodResolver(TemplateGenerationConfigSchema),
    defaultValues: {
      topic: '',
      templateType: 'Checklist',
    },
  });

  const onEbookSubmit = async (values: GenerationConfig) => {
    setError(null);
    setIsLoading(true);
    setGeneratedEbook(null);

    try {
      const response = await fetch('/api/create-ebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: values.topic, category: values.category }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const ebookData: EbookContent = await response.json();
      
      const coverImage = generateGradientSVG(ebookData.title, ebookData.subtitle || '', values.category);
      
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

  const onTemplateSubmit = async (values: TemplateGenerationConfig) => {
    setError(null);
    setIsLoading(true);
    setGeneratedTemplate(null);
    
    try {
        const response = await fetch('/api/create-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const templateData: TemplateContent = await response.json();
        setGeneratedTemplate(templateData);
    } catch (e: any) {
        setError(`Failed to generate template: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const saveToHistory = async (productData: EbookContent | TemplateContent, productType: 'Ebook' | 'Template') => {
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

  const handleDownloadTemplate = async () => {
    if (!generatedTemplate) return;
    downloadFile(generatedTemplate.content, `${generatedTemplate.title.replace(/\s+/g, '_')}.txt`, 'text/plain');
    await saveToHistory(generatedTemplate, 'Template');
  };
  
  const handleResetEbook = () => {
    setGeneratedEbook(null);
    ebookForm.reset();
  }

  const handleResetTemplate = () => {
    setGeneratedTemplate(null);
    templateForm.reset();
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
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="ebook">E-book</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
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
                         <FormField
                          control={ebookForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="ai">AI</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                  <SelectItem value="education">Education</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                </SelectContent>
                              </Select>
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

           <TabsContent value="template">
            {generatedTemplate ? (
              <Card className="glass-card animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Your Template is Ready!</CardTitle>
                    <CardDescription>Review your generated template and download it as a text file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">{generatedTemplate.title}</h2>
                        <p className="text-muted-foreground text-lg">{`A ${templateForm.getValues('templateType')} template for "${templateForm.getValues('topic')}"`}</p>
                    </div>
                    <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap font-mono h-64 overflow-auto">
                      {generatedTemplate.content}
                    </pre>
                    <div className="flex gap-4 pt-4">
                        <Button onClick={handleDownloadTemplate} size="lg" className="h-12 text-lg">
                            <Download />
                            <span className="ml-2">Download .txt</span>
                        </Button>
                        <Button onClick={handleResetTemplate} size="lg" variant="outline" className="h-12 text-lg">
                            <RefreshCw />
                            <span className="ml-2">Generate Another</span>
                        </Button>
                    </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Generate a New Template</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Form {...templateForm}>
                    <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-6">
                        <FormField
                            control={templateForm.control}
                            name="templateType"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">Template Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Select a template type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Checklist">Checklist</SelectItem>
                                        <SelectItem value="Planner">Planner</SelectItem>
                                        <SelectItem value="Worksheet">Worksheet</SelectItem>
                                        <SelectItem value="Guide">Guide</SelectItem>
                                        <SelectItem value="Outline">Outline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={templateForm.control}
                            name="topic"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">Topic</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="e.g., 'Weekly meal planning' or 'Social media content strategy'"
                                        className="h-12 text-base"
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <FileText />}
                            <span className="ml-2">Generate Template</span>
                        </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
           </TabsContent>
        </Tabs>
      

      {error && <ErrorDisplay message={error} />}
    </div>
  );
}

    