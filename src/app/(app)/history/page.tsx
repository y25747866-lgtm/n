
'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Download, FileText, History, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EbookContent } from '@/lib/types';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildEbookPdf } from '@/lib/pdf-engine';

async function fetchHistory(userId: string) {
    const { data, error } = await supabase
        .from('generated_products')
        .select('*')
        .eq('user_id', userId)
        .order('generationDate', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

async function deleteHistoryItem(id: string) {
    const { error } = await supabase.from('generated_products').delete().eq('id', id);
    if (error) throw new Error(error.message);
}


function HistoryItemCard({ item }: { item: EbookContent & { id: string, productType: string, generationDate: string, coverImageUrl?: string } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => {
        toast({
            title: "Item Deleted",
            description: `"${item.title}" has been removed from your history.`,
        });
        queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: (error) => {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the item. Please try again.",
        });
        console.error("Error deleting document: ", error);
    }
  });


  const handleDownload = async () => {
    setIsDownloading(true);
    toast({ title: "Generating PDF...", description: "This might take a moment." });
    try {
      if (!item.coverImageUrl) {
          throw new Error("Cannot generate PDF without a cover image.");
      }
      const pdfBlob = await buildEbookPdf({
        title: item.title,
        subtitle: item.subtitle || '',
        coverUrl: item.coverImageUrl,
        chapters: item.chapters,
      });

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
      toast({ variant: "destructive", title: "PDF Generation Failed", description: "Could not generate the PDF." });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="glass-card flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-start gap-3 text-lg leading-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0 mt-0">
                Y
            </div>
            <span className="flex-1 truncate pt-1">{item.title}</span>
        </CardTitle>
        <CardDescription>
            {new Date(item.generationDate).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <Badge variant="secondary">{item.productType}</Badge>
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Chapters:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                {item.chapters?.map(chapter => (
                    <li key={chapter.title} className="truncate">{chapter.title}</li>
                ))}
            </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
         <div className="flex w-full gap-2">
            <Button className="flex-1" variant="outline" onClick={handleDownload} disabled={isDownloading || !item.coverImageUrl}>
                {isDownloading ? <Loader2 className="animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this item
                    from your history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function HistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
      const getUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              setUserId(user.id);
          }
      };
      getUser();
  }, []);
  
  const { data: history, isLoading } = useQuery({
      queryKey: ['history', userId],
      queryFn: () => fetchHistory(userId!),
      enabled: !!userId,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8" />
            Generation History
        </h1>
        <p className="text-muted-foreground">
          Here are all the digital products you've created.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                 <Card key={i} className="glass-card flex flex-col">
                    <CardHeader className="pb-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-1/3" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      )}

      {!isLoading && history && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => (
            <HistoryItemCard key={item.id} item={item as any} />
          ))}
        </div>
      )}

      {!isLoading && (!history || history.length === 0) && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven't generated any products yet.</p>
          <Button variant="link" asChild>
            <a href="/generate">Start creating now</a>
          </Button>
        </div>
      )}
    </div>
  );
}
