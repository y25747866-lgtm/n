"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Download, BookCheck, FileText, Bot } from "lucide-react";
import { EbookContent, EbookOutline } from "@/lib/types";
import { generateOutlineAction } from "@/app/actions/generate-outline-action";
import { generateChapterAction } from "@/app/actions/generate-chapter-action";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { getCoverImage } from "@/lib/cover-engine";
import { useSubscription } from "@/contexts/subscription-provider";
import { buildEbookPdf } from "@/lib/pdf-engine";
import { supabase } from "@/lib/supabase";

export default function GeneratePage() {
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EbookContent | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [outline, setOutline] = useState<EbookOutline | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setOutline(null);
    setProgress(0);
    setProgressMessage("Warming up the engines...");

    try {
      // 1. Generate Outline
      setProgressMessage("Drafting the blueprint...");
      setProgress(10);
      const outlineResult = await generateOutlineAction(topic);
      if (!outlineResult.ok || !outlineResult.outline) {
        throw new Error(outlineResult.error || "Failed to generate outline.");
      }
      setOutline(outlineResult.outline);
      setProgress(20);

      // 2. Generate Cover (concurrently)
      setProgressMessage("Designing a stunning cover...");
      const coverPromise = getCoverImage({
        topic,
        creditsAvailable: subscription.credits,
      });
      
      // 3. Generate Chapters sequentially
      const totalChapters = outlineResult.outline.chapters.length;
      const chaptersContent: { title: string; content: string }[] = [];
      for (let i = 0; i < totalChapters; i++) {
        const chapterTitle = outlineResult.outline.chapters[i];
        setProgressMessage(`Writing Chapter ${i + 1}/${totalChapters}: "${chapterTitle}"`);
        
        const chapterResult = await generateChapterAction(topic, chapterTitle);
        if (!chapterResult.ok || !chapterResult.content) {
            // This allows the process to continue even if one chapter fails, filling it with a note.
            console.error(`Failed to generate content for chapter: ${chapterTitle}. Error: ${chapterResult.error}`);
            chaptersContent.push({ title: chapterTitle, content: `[Content generation failed for this chapter. Please try again or regenerate the book.]` });
        } else {
            chaptersContent.push({ title: chapterTitle, content: chapterResult.content });
        }
        
        // Update progress after each chapter
        setProgress(20 + Math.round(((i + 1) / totalChapters) * 70));
      }
      
      // 4. Await cover image
      setProgressMessage("Adding the final touches to the cover...");
      const coverResult = await coverPromise;
      const coverImageUrl = coverResult.url;
      setProgress(95);

      const finalEbook: EbookContent = {
        title: outlineResult.outline.title,
        subtitle: outlineResult.outline.subtitle,
        chapters: chaptersContent,
        coverImageUrl: coverImageUrl,
        // The conclusion is often part of the last chapter in this new flow.
        // If you need a separate conclusion, you can add another generation step.
        conclusion: "Thank you for reading. We hope this book has provided you with valuable insights.",
      };
      setResult(finalEbook);

      // 5. Save to History
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProgressMessage("Saving your new masterpiece...");
        const docId = uuidv4();
        const { error: dbError } = await supabase.from('generated_products').insert({
            id: docId,
            user_id: user.id,
            title: finalEbook.title,
            subtitle: finalEbook.subtitle,
            chapters: finalEbook.chapters,
            conclusion: finalEbook.conclusion,
            coverImageUrl: finalEbook.coverImageUrl,
            topic: topic,
            productType: 'Ebook',
            generationDate: new Date().toISOString(),
        });
        
        if (dbError) {
             console.error("Failed to save to history:", dbError);
             setError("E-book generated, but failed to save to your history. " + dbError.message);
        } else {
            toast({
                title: "Saved to History",
                description: "Your new e-book has been saved to your generation history."
            });
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unknown error occurred during generation.");
      setProgress(0);
    } finally {
      setIsLoading(false);
      setProgress(100);
      setProgressMessage("All done!");
    }
  };

  const handleDownload = async () => {
    if (!result || !result.coverImageUrl) return;
    setIsDownloading(true);
    toast({ title: "Generating PDF...", description: "This might take a moment. Please wait." });

    try {
      const pdfBlob = await buildEbookPdf({
        title: result.title,
        subtitle: result.subtitle || '',
        coverUrl: result.coverImageUrl,
        chapters: result.chapters,
      });
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.title.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: "Your PDF e-book is now downloading."
      });

    } catch(err: any) {
        console.error("PDF Generation Error:", err);
        setError(err.message || "Failed to generate PDF.");
        toast({
            variant: "destructive",
            title: "PDF Generation Failed",
            description: err.message || "An error occurred while creating the PDF file."
        });
    } finally {
        setIsDownloading(false);
    }
  }

  return (
    <main className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI E-Book Generator
        </h1>
        <p className="text-muted-foreground">
          Enter a topic and let our AI craft a complete e-book for you, chapter by chapter.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-lg">
            E-Book Topic
          </Label>
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-4 text-base h-12"
            placeholder="e.g., 'The Ultimate Guide to Digital Marketing in 2025'"
            disabled={isLoading}
          />
        </div>

        <Button onClick={handleGenerate} disabled={!topic || isLoading} size="lg" className="w-full h-12 text-lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Your E-Book
            </>
          )}
        </Button>
      </div>
      
      {isLoading && (
         <div className="space-y-4 text-center p-8 border rounded-lg">
            <div className="flex justify-center items-center">
                 <Bot className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground animate-pulse">{progressMessage}</p>
            <Progress value={progress} className="w-full" />
        </div>
      )}


      {error && (
        <Alert variant="destructive">
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && !isLoading &&(
        <div className="text-center p-8 border-2 border-dashed rounded-lg animate-fade-in space-y-4">
          <div>
            <BookCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-1">{result.title}</h2>
            <p className="text-muted-foreground mb-4">{result.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-2">
                {result.chapters.map(c => (
                    <div key={c.title} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {c.title}
                    </div>
                ))}
            </div>
          </div>
          <Button onClick={handleDownload} disabled={isDownloading} size="lg">
              {isDownloading ? (
                  <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating PDF...
                  </>
              ) : (
                  <>
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF
                  </>
              )}
          </Button>
        </div>
      )}
    </main>
  );
}