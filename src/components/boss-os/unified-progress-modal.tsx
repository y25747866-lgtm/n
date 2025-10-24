"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { ProductPackagePreview } from "./product-package-preview";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";

type GenerationParams = {
  topic: string;
  // Add other params from form if needed
};

type JobStatus = "pending" | "running" | "completed" | "error";

export function UnifiedProgressModal({ isOpen, onClose, generationParams }: { isOpen: boolean, onClose: () => void, generationParams: GenerationParams }) {
  const [contentProgress, setContentProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [contentStatus, setContentStatus] = useState<JobStatus>("running");
  const [coverStatus, setCoverStatus] = useState<JobStatus>("running");

  const isComplete = contentStatus === "completed" && coverStatus === "completed";
  const hasError = contentStatus === "error" || coverStatus === "error";

  useEffect(() => {
    if (!isOpen) return;

    // Reset state on open
    setContentProgress(0);
    setCoverProgress(0);
    setContentStatus("running");
    setCoverStatus("running");
    
    // Simulate content generation
    const contentInterval = setInterval(() => {
      setContentProgress(prev => {
        if (prev >= 100) {
          clearInterval(contentInterval);
          setContentStatus("completed");
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate cover generation
    const coverInterval = setInterval(() => {
      setCoverProgress(prev => {
        if (prev >= 100) {
          clearInterval(coverInterval);
          setCoverStatus("completed");
          return 100;
        }
        return prev + 8; // Faster
      });
    }, 150);

    return () => {
      clearInterval(contentInterval);
      clearInterval(coverInterval);
    };
  }, [isOpen]);

  const handleRetryJob = (job: 'content' | 'cover') => {
    if (job === 'content') {
        setContentStatus('running');
        setContentProgress(0);
        // re-run simulation logic
    } else {
        setCoverStatus('running');
        setCoverProgress(0);
        // re-run simulation logic
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[500px] flex flex-col">
        {isComplete ? (
            <ProductPackagePreview generationParams={generationParams} />
        ) : (
            <>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Your Product is Brewing</DialogTitle>
                    <DialogDescription>
                        Our AI is crafting your content and cover. Feel free to monitor the progress.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-8 py-6">
                    {hasError && (
                        <Alert variant="destructive">
                          <Terminal className="h-4 w-4" />
                          <AlertTitle>Generation Error</AlertTitle>
                          <AlertDescription>
                            One of the generation jobs failed. You can retry the failed job or continue with the completed assets.
                          </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label>Content Generation</label>
                            <span className="text-sm font-medium">{contentProgress}%</span>
                        </div>
                        <Progress value={contentProgress} />
                        {contentStatus === 'error' && (
                            <div className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleRetryJob('content')}>Retry Content</Button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label>Cover Generation</label>
                            <span className="text-sm font-medium">{coverProgress}%</span>
                        </div>
                        <Progress value={coverProgress} className="[&>*]:bg-gradient-to-r [&>*]:from-accent-1-start [&>*]:to-accent-1-end" />
                         {coverStatus === 'error' && (
                            <div className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleRetryJob('cover')}>Retry Cover</Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel All</Button>
                    {(contentStatus === 'completed' && coverStatus === 'error') &&
                        <Button onClick={onClose}>Continue Without Cover</Button>
                    }
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
