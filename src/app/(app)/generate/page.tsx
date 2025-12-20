
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { marked } from 'marked';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, BookOpen, FileText, Download } from 'lucide-react';
import { generateReportAction } from '@/app/actions/generate-report-action';
import { generateChapterAction } from '@/app/actions/generate-chapter-action';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import { EbookContent, EbookOutline } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  topic: z.string().min(10, {
    message: 'Please enter a topic with at least 10 characters.',
  }),
});


export default function GeneratePage() {
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<EbookOutline | null>(null);
  const [chaptersContent, setChaptersContent] = useState<Record<string, string>>({});
  const [activeChapterTitle, setActiveChapterTitle] = useState<string | null>(null);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  const parseOutline = (content: string): EbookOutline | null => {
    try {
        const titleMatch = content.match(/BOOK_TITLE:\s*([\s\S]*?)\s*BOOK_SUBTITLE:/);
        const subtitleMatch = content.match(/BOOK_SUBTITLE:\s*([\s\S]*?)\s*BOOK_DESCRIPTION:/);
        const tocMatch = content.match(/TABLE_OF_CONTENTS:\s*([\s\S]*?)---/);

        if (!titleMatch || !tocMatch) {
            console.error("Could not parse outline from content:", content);
            throw new Error("The AI returned an improperly formatted outline. Please try again.");
        }

        const chapters = tocMatch[1].trim().split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim());

        return {
            title: titleMatch[1].trim(),
            subtitle: subtitleMatch ? subtitleMatch[1].trim() : '',
            chapters: chapters,
        };
    } catch(e: any) {
        setError(e.message);
        return null;
    }
  };


  async function onOutlineSubmit(values: z.infer<typeof formSchema>) {
    setIsLoadingOutline(true);
    setError(null);
    setOutline(null);
    setChaptersContent({});
    setActiveChapterTitle(null);

    try {
      const result = await generateReportAction(values.topic);
      if (result.content) {
        const parsedOutline = parseOutline(result.content);
        if (parsedOutline) {
            setOutline(parsedOutline);
        }
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
    if (!outline) return;

    setIsLoadingChapter(chapterTitle);
    setError(null);
    setActiveChapterTitle(chapterTitle);

    // Use cached content if available
    if (chaptersContent[chapterTitle]) {
      setIsLoadingChapter(null);
      return;
    }

    try {
      const result = await generateChapterAction(outline.title, chapterTitle);
      if (result.content) {
        setChaptersContent(prev => ({ ...prev, [chapterTitle]: result.content! }));
      } else {
        setError(`The AI returned an empty response for the chapter: "${chapterTitle}".`);
      }
    } catch (e: any) {
      setError(e.message || `An unexpected error occurred during generation of chapter: "${chapterTitle}".`);
    } finally {
      setIsLoadingChapter(null);
    }
  }
  
  const allChaptersGenerated = outline && outline.chapters.length > 0 && outline.chapters.every(ch => chaptersContent[ch]);

  const handleSaveToHistory = async () => {
    if (!outline || !allChaptersGenerated || !firestore || !user) return;
    
    const ebookData: EbookContent = {
        title: outline.title,
        subtitle: outline.subtitle,
        chapters: outline.chapters.map(chapterTitle => ({
            title: chapterTitle,
            content: chaptersContent[chapterTitle]
        })),
        conclusion: "This is a placeholder conclusion. The real one would be generated.", // Placeholder
    };
    
    try {
        const docId = uuidv4();
        const docRef = collection(firestore, 'users', user.uid, 'generatedProducts');
        
        await addDoc(docRef, {
            id: docId,
            ...ebookData,
            productType: 'Ebook',
            generationDate: new Date().toISOString(),
            topic: form.getValues('topic'),
        });
        
        toast({
            title: "E-book Saved!",
            description: "Your new e-book has been saved to your history.",
        });

        router.push('/history');

    } catch (error) {
        console.error("Error saving document:", error);
        setError("Could not save the e-book to your history. Please try again.");
    }
  }

  const activeContent = activeChapterTitle ? chaptersContent[activeChapterTitle] : null;

  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-primary" />
          <span className="bg-clip-text text-transparent bg-accent-gradient-1">Product Generator</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Generate a full digital product from a single idea.
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

      {outline && (
        <Card className="glass-card fade-in">
          <CardHeader>
            <CardTitle className="text-3xl">{outline.title}</CardTitle>
            {outline.subtitle && <CardDescription className="text-lg">{outline.subtitle}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Chapters</h3>
              <div className="flex flex-col items-start gap-2">
                {outline.chapters.map((chapter, index) => (
                  <Button
                    key={index}
                    variant={activeChapterTitle === chapter ? (chaptersContent[chapter] ? "default" : "secondary") : (chaptersContent[chapter] ? "outline" : "ghost")}
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
             {allChaptersGenerated && (
                <div className="pt-6 text-center">
                    <p className="text-green-500 mb-4">All chapters have been generated!</p>
                    <Button size="lg" onClick={handleSaveToHistory}>
                        <Download className="mr-2"/>
                        Save & Continue to Download
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      )}

      {(isLoadingChapter && !activeContent) || activeContent ? (
        <Card className="glass-card fade-in">
          <CardHeader>
            <CardTitle>{activeChapterTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingChapter && !activeContent && (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating chapter... this can take a minute.</p>
              </div>
            )}
            {activeContent && (
              <div 
                className="prose prose-sm md:prose-base prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(activeContent) }} 
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

    