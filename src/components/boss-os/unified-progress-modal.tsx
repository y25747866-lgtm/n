
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Book, Image as ImageIcon, Sparkles, Check, AlertTriangle, X, Loader2 } from 'lucide-react';
import {
  type GenerationConfig,
  type EbookContent,
  type JobStatus,
} from '@/lib/types';
import { generateEbookContent } from '@/ai/flows/generate-ebook-content';
import { generateCoverImage } from '@/ai/flows/generate-cover-image';

type Job = {
  id: 'content' | 'cover';
  name: string;
  Icon: React.ElementType;
  status: JobStatus;
  progress: number;
  result: any | null;
  error?: string;
  action: (config: any) => Promise<any>;
};

export default function UnifiedProgressModal({
  config,
  onComplete,
  onError,
  onClose,
}: {
  config: GenerationConfig;
  onComplete: (result: EbookContent) => void;
  onError: (error: string) => void;
  onClose: () => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'content',
      name: 'Content Generation',
      Icon: Book,
      status: 'pending',
      progress: 0,
      result: null,
      action: generateEbookContent,
    },
    {
      id: 'cover',
      name: 'Cover Generation',
      Icon: ImageIcon,
      status: 'pending',
      progress: 0,
      result: null,
      action: (config) =>
        generateCoverImage({
          topic: config.topic,
          style: config.coverStyle,
          title: 'Untitled', // Will be updated after content generation
          subtitle: '...',
          author: config.authorName || 'Nexora OS',
        }),
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const hasStartedRef = useRef(false);

  const updateJob = (id: 'content' | 'cover', updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
    );
  };

  const getFriendlyErrorMessage = (error: any): string => {
    let message = error.message || 'An unknown error occurred.';
    if (message.includes('API key not valid')) {
      return 'API key not valid. Please check your .env file and ensure GEMINI_API_KEY is correct.';
    }
     if (message.includes('429')) {
      return 'API rate limit exceeded. Please wait a moment and try again.';
    }
    // Return a condensed version of a long error
    if (message.length > 200) {
        return message.substring(0, 200) + '...';
    }
    return message;
  }

  const runJobs = useCallback(async () => {
    const contentJob = jobs.find((j) => j.id === 'content')!;

    // Start content generation
    updateJob('content', { status: 'running', progress: 10 });
    const progressInterval = setInterval(() => {
      setJobs(prev => prev.map(j => {
        if (j.id === 'content' && j.status === 'running' && j.progress < 90) {
          return { ...j, progress: j.progress + 5 };
        }
        return j;
      }));
    }, 500);

    let contentResult: EbookContent;
    try {
      contentResult = await contentJob.action(config);
      clearInterval(progressInterval);
      updateJob('content', { status: 'completed', progress: 100, result: contentResult });
    } catch (e: any) {
      clearInterval(progressInterval);
      const errorMessage = getFriendlyErrorMessage(e);
      updateJob('content', { status: 'error', error: errorMessage });
      onError(errorMessage);
      return;
    }

    // Now start cover generation with the real title
    const coverJob = jobs.find((j) => j.id === 'cover')!;
    updateJob('cover', { status: 'running', progress: 10 });
    const coverConfig = {
        ...config,
        title: contentResult.title,
        subtitle: contentResult.subtitle,
    };

    try {
      const coverResult = await coverJob.action(coverConfig);
      updateJob('cover', { status: 'completed', progress: 100, result: coverResult });
      
      onComplete({
        ...contentResult,
        coverImageUrl: coverResult.imageUrl,
        cover_image_prompt: coverResult.prompt,
      });

    } catch (e: any) {
        const errorMessage = getFriendlyErrorMessage(e);
        updateJob('cover', { status: 'error', error: errorMessage });
        // Even if cover fails, we can still complete with the content
        onComplete({
            ...contentResult,
            coverImageUrl: '',
            cover_image_prompt: 'Cover generation failed.',
        });
    }
  }, [config, onComplete, onError]);

  useEffect(() => {
    if (config && !hasStartedRef.current) {
      hasStartedRef.current = true;
      runJobs();
    }
  }, [config, runJobs]);


  const allComplete = jobs.every((job) => job.status === 'completed' || job.status === 'error');
  const anyError = jobs.some((job) => job.status === 'error');
  const firstError = jobs.find(job => job.error)?.error;
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) onClose(); setIsDialogOpen(open); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Generating Your Product
          </DialogTitle>
          <DialogDescription>
            The AI is crafting your content and cover. Please wait a few moments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <AnimatePresence>
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <job.Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{job.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'pending' && <span className="text-muted-foreground">Waiting...</span>}
                    {job.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {job.status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
                    {job.status === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <span className="font-mono text-xs w-10 text-right">{job.progress}%</span>
                  </div>
                </div>
                <Progress value={job.progress} />
                 {job.status === 'error' && job.error && (
                    <p className="text-xs text-destructive">{job.error}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {anyError && !firstError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>
                An unexpected error occurred during generation.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {allComplete && (
            <div className="flex justify-end pt-4">
                <Button onClick={onClose} >
                    <Check className="mr-2 h-4 w-4" />
                    View Product
                </Button>
            </div>
        )}
        {!allComplete && !anyError && (
             <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={onClose}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
