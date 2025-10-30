
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { ProductPackagePreview } from "./product-package-preview";
import { Alert, AlertDescription, AlertTitle as AlertTitleComponent } from "../ui/alert";
import { Terminal } from "lucide-react";
import { generateEbookContent, GenerateEbookContentInput, GenerateEbookContentOutput } from "@/ai/flows/generate-ebook-content";
import { generateCoverImage, GenerateCoverImageInput, GenerateCoverImageOutput } from "@/ai/flows/generate-cover-image";

export type GenerationParams = Omit<GenerateEbookContentInput, 'authorName'> & Omit<GenerateCoverImageInput, 'title' | 'authorName'> & { authorName: string };

type JobStatus = "pending" | "running" | "completed" | "error";

interface ProductResult {
    content: GenerateEbookContentOutput | null;
    cover: GenerateCoverImageOutput | null;
    params: GenerationParams | null;
}

export function UnifiedProgressModal({ isOpen, onClose, generationParams }: { isOpen: boolean, onClose: () => void, generationParams: GenerationParams }) {
  const [contentProgress, setContentProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [contentStatus, setContentStatus] = useState<JobStatus>("pending");
  const [coverStatus, setCoverStatus] = useState<JobStatus>("pending");
  const [productResult, setProductResult] = useState<ProductResult>({ content: null, cover: null, params: null });
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const isComplete = contentStatus === "completed" && coverStatus === "completed";
  const hasError = contentStatus === "error" || coverStatus === "error";

  const runJobs = useCallback(async () => {
    if (hasRun.current) return;
    hasRun.current = true;

    setContentStatus("running");
    setCoverStatus("pending");
    setError(null);
    setProductResult({ content: null, cover: null, params: generationParams });

    let contentInterval: NodeJS.Timeout | null = null;
    let coverInterval: NodeJS.Timeout | null = null;

    try {
        contentInterval = setInterval(() => {
            setContentProgress(prev => Math.min(prev + Math.random() * 5, 95));
        }, 800);

        const contentResult = await generateEbookContent(generationParams);
        
        if (contentInterval) clearInterval(contentInterval);
        setContentProgress(100);
        setContentStatus("completed");
        setProductResult(prev => ({...prev, content: contentResult}));

        setCoverStatus("running");
        coverInterval = setInterval(() => {
            setCoverProgress(prev => Math.min(prev + Math.random() * 10, 95));
        }, 200);

        const coverResult = await generateCoverImage({
            ...generationParams,
            title: contentResult.title,
        });

        if (coverInterval) clearInterval(coverInterval);
        setCoverProgress(100);
        setCoverStatus("completed");
        setProductResult(prev => ({...prev, cover: coverResult}));

    } catch (e: any) {
        console.error("A generation job failed:", e);
        setError(e.message || "An unknown error occurred during generation.");
        if (contentInterval) clearInterval(contentInterval);
        if (coverInterval) clearInterval(coverInterval);

        if (contentStatus !== 'completed') {
            setContentStatus("error");
            setContentProgress(100);
        }
        if (coverStatus !== 'completed') {
            setCoverStatus("error");
            setCoverProgress(100);
        }
    }
  }, [generationParams]);


  useEffect(() => {
    if (isOpen) {
      runJobs();
    }
  }, [isOpen, runJobs]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setContentProgress(0);
      setCoverProgress(0);
      setContentStatus("pending");
      setCoverStatus("pending");
      setError(null);
      setProductResult({ content: null, cover: null, params: null });
      hasRun.current = false;
    }, 300);
  };
  
  const handleRetry = () => {
    setContentProgress(0);
    setCoverProgress(0);
    setContentStatus("pending");
    setCoverStatus("pending");
    hasRun.current = false;
    // We don't call runJobs() directly here, useEffect will handle it
    // This state reset will allow the effect to run again if needed.
    // A more robust implementation might involve a specific retry state.
    // For now, we'll re-trigger the effect by ensuring hasRun is false and dependencies are clean.
    runJobs();
  };
  
  const getDialogContent = () => {
    if (isComplete && productResult.content && productResult.cover && productResult.params) {
      return <ProductPackagePreview productResult={productResult as {content: GenerateEbookContentOutput, cover: GenerateCoverImageOutput, params: GenerationParams}} />;
    }

    return (
        <>
            <DialogHeader className="text-center pt-8">
                <DialogTitle className="text-2xl font-bold">Your Product is Brewing</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                    Our AI is crafting your content and cover. Feel free to monitor the progress.
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-8 py-6">
                {hasError && (
                    <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitleComponent>Generation Error</AlertTitleComponent>
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
                  <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                )}
            </DialogFooter>
        </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-4xl min-h-[500px] flex flex-col">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
