
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
import { Loader2, Wand2, BookOpen, FileText } from 'lucide-react';
import { generateReportAction } from '@/app/actions/generate-report-action';
import { generateChapterAction } from '@/app/actions/generate-chapter-action';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  topic: z.string().min(10, {
    message: 'Please enter a topic with at least 10 characters.',
  }),
});

interface ParsedOutline {
  title: string;
  subtitle: string;
  description: string;
  chapters: string[];
}

export default function GeneratePage() {
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<ParsedOutline | null>(null);
  const [generatedChapterContent, setGeneratedChapterContent] = useState<string | null>(null);
  const [activeChapterTitle, setActiveChapterTitle] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  const parseOutline = (content: string): ParsedOutline => {
    const titleMatch = content.match(/BOOK_TITLE:\s*([\s\S]*?)\s*BOOK_SUBTITLE:/);
    const subtitleMatch = content.match(/BOOK_SUBTITLE:\s*([\s\S]*?)\s*BOOK_DESCRIPTION:/);
    const descriptionMatch = content.match(/BOOK_DESCRIPTION:\s*([\s\S]*?)\s*---/);
    const tocMatch = content.match(/TABLE_OF_CONTENTS:\s*([\s\S]*?)---/);

    const chapters = tocMatch ? tocMatch[1].trim().split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()) : [];

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Generated Outline',
      subtitle: subtitleMatch ? subtitleMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : 'Here is the outline for your new digital product.',
      chapters: chapters,
    };
  };

  async function onOutlineSubmit(values: z.infer<typeof formSchema>) {
    setIsLoadingOutline(true);
    setError(null);
    setGeneratedOutline(null);
    setGeneratedChapterContent(null);
    setActiveChapterTitle(null);

    try {
      const result = await generateReportAction(values.topic);
      if (result.content) {
        setGeneratedOutline(parseOutline(result.content));
      } else {
        setError('The AI returned an empty response for the outline.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during outline generation.');
    } finally {
      setIsLoadingOutline(false);
    }
  }

  async function onChapterGenerate(chapterTitle: string) {
    if (!generatedOutline) return;

    setIsLoadingChapter(chapterTitle);
    setError(null);
    setGeneratedChapterContent(null);
    setActiveChapterTitle(chapterTitle);

    try {
      const result = await generateChapterAction(generatedOutline.title, chapterTitle);
      if (result.content) {
        setGeneratedChapterContent(result.content);
      } else {
        setError('The AI returned an empty response for the chapter.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during chapter generation.');
    } finally {
      setIsLoadingChapter(null);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-primary" />
          <span className="bg-clip-text text-transparent bg-accent-gradient-1">Product Generator</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Describe the topic for your next digital product.
        </p>
      </header>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>New Product Outline</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onOutlineSubmit)} className="space-y-4">
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
              <Button type="submit" disabled={isLoadingOutline}>
                {isLoadingOutline ? <Loader2 className="animate-spin" /> : 'Generate Outline'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && <ErrorDisplay message={error} />}

      {generatedOutline && (
        <Card className="glass-card fade-in">
          <CardHeader>
            <CardTitle className="text-3xl">{generatedOutline.title}</CardTitle>
            {generatedOutline.subtitle && <CardDescription className="text-lg">{generatedOutline.subtitle}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileText className="h-5 w-5" /> Description</h3>
              <p className="text-muted-foreground">{generatedOutline.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Chapters</h3>
              <div className="flex flex-col items-start gap-2">
                {generatedOutline.chapters.map((chapter, index) => (
                  <Button
                    key={index}
                    variant={activeChapterTitle === chapter ? "default" : "outline"}
                    onClick={() => onChapterGenerate(chapter)}
                    disabled={!!isLoadingChapter}
                    className="w-full justify-start text-left h-auto py-2"
                  >
                    {isLoadingChapter === chapter ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <span className="w-6 mr-2 text-center">{index + 1}</span>
                    )}
                    <span className="flex-1">{chapter}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(isLoadingChapter || generatedChapterContent) && (
        <Card className="glass-card fade-in">
          <CardHeader>
            <CardTitle>{activeChapterTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingChapter && (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating chapter... this can take a minute.</p>
              </div>
            )}
            {generatedChapterContent && (
              <div 
                className="prose prose-sm md:prose-base prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(generatedChapterContent) }} 
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
