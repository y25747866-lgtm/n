"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { ProductPackagePreview } from "./product-package-preview";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";
import { generateEbookContent, GenerateEbookContentInput, GenerateEbookContentOutput } from "@/ai/flows/generate-ebook-content";
import { generateCoverImage, GenerateCoverImageInput, GenerateCoverImageOutput } from "@/ai/flows/generate-cover-image";

export type GenerationParams = Omit<GenerateEbookContentInput, 'authorName'> & Omit<GenerateCoverImageInput, 'title' | 'authorName'> & { authorName: string };

type JobStatus = "pending" | "running" | "completed" | "error";

interface ProductResult {
    content: GenerateEbookContentOutput | null;
    cover: GenerateCoverImageOutput | null;
}

export function UnifiedProgressModal({ isOpen, onClose, generationParams }: { isOpen: boolean, onClose: () => void, generationParams: GenerationParams }) {
  const [contentProgress, setContentProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [contentStatus, setContentStatus] = useState<JobStatus>("pending");
  const [coverStatus, setCoverStatus] = useState<JobStatus>("pending");
  const [productResult, setProductResult] = useState<ProductResult>({ content: null, cover: null });
  const [error, setError] = useState<string | null>(null);

  const isComplete = contentStatus === "completed" && coverStatus === "completed";
  const hasError = contentStatus === "error" || coverStatus === "error";

  const runJobs = async () => {
    setContentStatus("running");
    setCoverStatus("pending");
    setError(null);
    setProductResult({ content: null, cover: null });

    let generatedContent: GenerateEbookContentOutput | null = null;
    try {
      const contentResult = await generateEbookContent(generationParams);
      generatedContent = contentResult;
      setContentStatus("completed");
      setProductResult(prev => ({ ...prev, content: contentResult }));
    } catch (e: any) {
      console.error("Content generation failed:", e);
      setError(e.message || "Failed to generate ebook content.");
      setContentStatus("error");
      return;
    }

    if (generatedContent) {
      setCoverStatus("running");
      try {
        const coverResult = await generateCoverImage({
          ...generationParams,
          title: generatedContent.title,
        });
        setCoverStatus("completed");
        setProductResult(prev => ({ ...prev, cover: coverResult }));
      } catch (e: any) {
        console.error("Cover generation failed:", e);
        setError(e.message || "Failed to generate cover image.");
        setCoverStatus("error");
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    runJobs();
  }, [isOpen]);

  useEffect(() => {
    let contentInterval: NodeJS.Timeout | undefined;
    if (contentStatus === 'running') {
      setContentProgress(0);
      contentInterval = setInterval(() => {
        setContentProgress(prev => Math.min(prev + Math.random() * 5, 99));
      }, 500);
    } else if (contentStatus === 'completed') {
      if (contentInterval) clearInterval(contentInterval);
      setContentProgress(100);
    } else if (contentStatus === 'error') {
        if (contentInterval) clearInterval(contentInterval);
    }
    return () => clearInterval(contentInterval);
  }, [contentStatus]);

  useEffect(() => {
    let coverInterval: NodeJS.Timeout | undefined;
    if (coverStatus === 'running') {
      setCoverProgress(0);
      coverInterval = setInterval(() => {
        setCoverProgress(prev => Math.min(prev + Math.random() * 7, 99));
      }, 400);
    } else if (coverStatus === 'completed') {
      if (coverInterval) clearInterval(coverInterval);
      setCoverProgress(100);
    } else if (coverStatus === 'error') {
        if (coverInterval) clearInterval(coverInterval);
    }
    return () => clearInterval(coverInterval);
  }, [coverStatus]);


  const handleRetry = () => {
    runJobs();
  };
  
  const getDialogContent = () => {
    if (isComplete && productResult.content && productResult.cover) {
      return <ProductPackagePreview productResult={productResult as {content: GenerateEbookContentOutput, cover: GenerateCoverImageOutput}} />;
    }

    return (
        <>
            <div className="text-center pt-8">
                <h2 className="text-2xl font-bold">Your Product is Brewing</h2>
                <p className="text-muted-foreground">
                    Our AI is crafting your content and cover. Feel free to monitor the progress.
                </p>
            </div>

            <div className="flex-1 space-y-8 py-6">
                {hasError && (
                    <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Generation Error</AlertTitle>
                      <AlertDescription>
                        {error || "An unknown error occurred."}
                      </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label>Content Generation</label>
                        <span className="text-sm font-medium capitalize">{contentStatus === 'completed' ? 'Complete' : contentStatus} {contentStatus === 'running' && `(${Math.round(contentProgress)}%)`}</span>
                    </div>
                    <Progress value={contentProgress} data-status={contentStatus} className="data-[status=error]:[&>*]:bg-destructive" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label>Cover Generation</label>
                        <span className="text-sm font-medium capitalize">{coverStatus === 'completed' ? 'Complete' : coverStatus} {coverStatus === 'running' && `(${Math.round(coverProgress)}%)`}</span>
                    </div>
                    <Progress value={coverProgress} data-status={coverStatus} className="[&>*]:bg-gradient-to-r [&>*]:from-accent-1-start [&>*]:to-accent-1-end data-[status=error]:[&>*]:bg-destructive" />
                </div>
            </div>

            <DialogFooter>
                {hasError ? (
                  <Button onClick={handleRetry}>Retry</Button>
                ) : (
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                )}
            </DialogFooter>
        </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[500px] flex flex-col">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
