
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Download, BookCheck, FileText, Bot } from "lucide-react";
import { EbookContent, EbookOutline } from "@/lib/types";
import { generateOutlineAction } from "@/app/actions/generate-outline-action";
import { generateChapter } from "@/app/actions/generate-chapter-action";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, collection } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { v4 as uuidv4 } from "uuid";
import { getCoverImage } from "@/lib/cover-engine";
import { useSubscription } from "@/contexts/subscription-provider";
import { buildEbookPdf } from "@/lib/pdf-engine";

export default function GeneratePage() {
  const { firestore, user } = useFirebase();
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

    try {
      // 1. Generate Outline
      setProgressMessage("Generating outline...");
      setProgress(10);
      const outlineResult = await generateOutlineAction(topic);
      if (!outlineResult.ok || !outlineResult.outline) {
        throw new Error(outlineResult.error || "Failed to generate outline.");
      }
      setOutline(outlineResult.outline);
      setProgress(20);

      // 2. Generate Cover (concurrently)
      setProgressMessage("Designing cover...");
      const coverPromise = getCoverImage({
        topic,
        creditsAvailable: subscription.credits,
      });
      
      // 3. Generate Chapters
      const chaptersContent: { title: string; content: string }[] = [];
      const totalChapters = outlineResult.outline.chapters.length;

      for (let i = 0; i < totalChapters; i++) {
        const chapterTitle = outlineResult.outline.chapters[i];
        setProgressMessage(`Writing Chapter ${i + 1}/${totalChapters}: ${chapterTitle}`);
        
        const chapterContent = await generateChapter(topic, chapterTitle);
        if (!chapterContent) {
            // Simple retry logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            const retryContent = await generateChapter(topic, chapterTitle);
            if(!retryContent){
                 throw new Error(`Failed to generate content for chapter: ${chapterTitle}`);
            }
            chaptersContent.push({ title: chapterTitle, content: retryContent });
        } else {
            chaptersContent.push({ title: chapterTitle, content: chapterContent });
        }
        
        setProgress(20 + Math.round(((i + 1) / totalChapters) * 60));
      }
      
      // 4. Generate Conclusion (as a chapter)
      setProgressMessage("Writing conclusion...");
      const conclusionContent = await generateChapter(topic, "Conclusion and Final Thoughts") || "An error occurred while generating the conclusion.";
      setProgress(90);

      // 5. Await cover
      const coverResult = await coverPromise;
      const coverImageUrl = coverResult.url;
      setProgress(95);

      const finalEbook: EbookContent = {
        title: outlineResult.outline.title,
        subtitle: outlineResult.outline.subtitle,
        chapters: chaptersContent,
        conclusion: conclusionContent,
        coverImageUrl: coverImageUrl,
      };
      setResult(finalEbook);

      // 6. Save to History
      if (firestore && user) {
        try {
            const docId = uuidv4();
            const docRef = doc(firestore, 'users', user.uid, 'generatedProducts', docId);

            await setDoc(docRef, {
                id: docId,
                userId: user.uid,
                title: finalEbook.title,
                subtitle: finalEbook.subtitle,
                chapters: finalEbook.chapters,
                conclusion: finalEbook.conclusion,
                coverImageUrl: finalEbook.coverImageUrl,
                topic: topic,
                productType: 'Ebook',
                generationDate: new Date().toISOString(),
            });
            toast({
                title: "Saved to History",
                description: "Your new e-book has been saved to your generation history."
            })
        } catch (dbError: any) {
            console.error("Failed to save to history:", dbError);
            setError("E-book generated, but failed to save to your history. " + dbError.message);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unknown error occurred during generation.");
    } finally {
      setIsLoading(false);
      setProgress(100);
      setProgressMessage("Done!");
    }
  };

  const handleDownload = async () => {
    if (!result || !result.coverImageUrl) return;
    setIsDownloading(true);
    toast({ title: "Generating PDF...", description: "This might take a moment." });

    try {
      const pdfBlob = await buildEbookPdf({
        title: result.title,
        subtitle: result.subtitle,
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

    } catch(err: any) {
        setError(err.message || "Failed to generate PDF.");
        toast({
            variant: "destructive",
            title: "PDF Generation Failed",
            description: "An error occurred while creating the PDF file."
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
          Enter a topic and let our AI craft a complete e-book for you, ready to download.
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
         <div className="space-y-4 text-center">
            <div className="flex justify-center items-center">
                 <Bot className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">{progressMessage}</p>
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
