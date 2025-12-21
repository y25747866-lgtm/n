
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
import { addDoc, collection } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { v4 as uuidv4 } from "uuid";
import { generateCoverAction } from "@/app/actions/generate-cover-action";
import { marked } from 'marked';

export default function GeneratePage() {
  const { firestore, user } = useFirebase();
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
      setProgress(25);

      // 2. Generate Chapters
      const chaptersContent: { title: string; content: string }[] = [];
      const totalChapters = outlineResult.outline.chapters.length;

      for (let i = 0; i < totalChapters; i++) {
        const chapterTitle = outlineResult.outline.chapters[i];
        setProgressMessage(`Writing Chapter ${i + 1}/${totalChapters}: ${chapterTitle}`);
        
        const chapterResult = await generateChapterAction(topic, chapterTitle);
        if (!chapterResult.ok || !chapterResult.content) {
            // Simple retry logic
            const retryResult = await generateChapterAction(topic, chapterTitle);
            if(!retryResult.ok || !retryResult.content){
                 throw new Error(chapterResult.error || `Failed to generate content for chapter: ${chapterTitle}`);
            }
            chaptersContent.push({ title: chapterTitle, content: retryResult.content });
        } else {
            chaptersContent.push({ title: chapterTitle, content: chapterResult.content });
        }
        
        setProgress(25 + Math.round(((i + 1) / totalChapters) * 65));
      }
      
      // 3. Generate Conclusion (as a chapter)
      setProgressMessage("Writing conclusion...");
      const conclusionResult = await generateChapterAction(topic, "Conclusion and Final Thoughts");
      const conclusionContent = conclusionResult.content || "An error occurred while generating the conclusion.";


      // 4. Generate Cover
      setProgressMessage("Designing cover...");
      const coverResult = await generateCoverAction(outlineResult.outline.title, outlineResult.outline.subtitle);
      const coverImageUrl = coverResult.imageUrl;
      setProgress(95);


      const finalEbook: EbookContent = {
        title: outlineResult.outline.title,
        subtitle: outlineResult.outline.subtitle,
        chapters: chaptersContent,
        conclusion: conclusionContent,
        coverImageUrl: coverImageUrl,
      };
      setResult(finalEbook);

      // 5. Save to History
      if (firestore && user) {
        try {
            await addDoc(collection(firestore, 'users', user.uid, 'generatedProducts'), {
                id: uuidv4(),
                ...finalEbook,
                topic: topic,
                productType: 'Ebook',
                generationDate: new Date().toISOString(),
            });
            toast({
                title: "Saved to History",
                description: "Your new e-book has been saved to your generation history."
            })
        } catch (dbError) {
            console.error("Failed to save to history:", dbError);
            // Don't throw, just notify
            setError("E-book generated, but failed to save to your history.");
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
    if (!result) return;
    setIsDownloading(true);
    toast({ title: "Generating PDF...", description: "This might take a moment." });

    try {
        const coverHtml = result.coverImageUrl ? `<div style="width:100%;height:100vh;display:flex;justify-content:center;align-items:center;background-image:url(${result.coverImageUrl});background-size:cover;background-position:center;"></div>` : '';
        const titlePageHtml = `<div style="page-break-after:always;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;text-align:center;"><h1>${result.title}</h1><h2>${result.subtitle}</h2></div>`;
        const tocHtml = `<div style="page-break-after:always;"><h2>Table of Contents</h2><ul>${result.chapters.map(c => `<li>${c.title}</li>`).join('')}<li>Conclusion</li></ul></div>`;
        const chaptersHtml = result.chapters.map(c => `<div style="page-break-after:always;"><h2>${c.title}</h2><div>${marked(c.content)}</div></div>`).join('');
        const conclusionHtml = `<div><h2>Conclusion</h2><div>${marked(result.conclusion)}</div></div>`;
        
        const fullHtml = `
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; margin: 40px; }
                        h1 { font-size: 50px; }
                        h2 { font-size: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-top: 40px; }
                        ul { list-style-type: none; padding-left: 0; }
                        li { font-size: 18px; margin-bottom: 10px; }
                        p { font-size: 16px; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    ${coverHtml}
                    ${titlePageHtml}
                    ${tocHtml}
                    ${chaptersHtml}
                    ${conclusionHtml}
                </body>
            </html>
        `;

        const response = await fetch('/api/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: fullHtml })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'PDF generation failed on the server.');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
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
