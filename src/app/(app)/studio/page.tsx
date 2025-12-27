
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Library, Loader2, Trash2 } from 'lucide-react';
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
import Image from 'next/image';

async function fetchCovers(userId: string) {
    const { data, error } = await supabase
        .from('generated_products')
        .select('id, title, coverImageUrl, generationDate')
        .eq('user_id', userId)
        .not('coverImageUrl', 'is', null) // Only fetch items that have a cover
        .order('generationDate', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

// This mutation will "delete" a cover by nullifying its URL in the database
async function deleteCoverImage(id: string) {
    const { error } = await supabase
        .from('generated_products')
        .update({ coverImageUrl: null })
        .eq('id', id);

    if (error) throw new Error(error.message);
}


function CoverCard({ item }: { item: { id: string, title: string, coverImageUrl: string, generationDate: string } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: deleteCoverImage,
    onSuccess: () => {
        toast({
            title: "Cover Deleted",
            description: `The cover for "${item.title}" has been removed.`,
        });
        queryClient.invalidateQueries({ queryKey: ['covers'] });
        queryClient.invalidateQueries({ queryKey: ['history'] }); // Also invalidate history
    },
    onError: (error) => {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the cover. Please try again.",
        });
        console.error("Error deleting cover: ", error);
    }
  });


  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(item.coverImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/ /g, '_')}_cover.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Started",
        description: `Downloading cover for "${item.title}".`
      });
    } catch (error) {
      console.error("Download failed", error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not download the image.'
      });
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <Card className="glass-card flex flex-col overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-[3/4] relative w-full">
            <Image 
                src={item.coverImageUrl} 
                alt={`Cover for ${item.title}`} 
                fill
                className="object-cover"
            />
        </div>
      </CardContent>
      <div className="p-4 border-t flex-1 flex flex-col">
        <CardTitle className="text-base leading-tight truncate">{item.title}</CardTitle>
        <CardDescription className="text-xs mt-1">
            {new Date(item.generationDate).toLocaleDateString()}
        </CardDescription>
        <CardFooter className="p-0 pt-4 mt-auto flex items-center gap-2">
            <Button className="flex-1" variant="outline" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the cover image for "{item.title}". You cannot undo this. The e-book content will remain in your history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : "Delete Cover"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </div>
    </Card>
  );
}

export default function CoverStudioPage() {
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
  
  const { data: covers, isLoading } = useQuery({
      queryKey: ['covers', userId],
      queryFn: () => fetchCovers(userId!),
      enabled: !!userId,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-8 w-8" />
            Cover Studio
        </h1>
        <p className="text-muted-foreground">
          Browse, download, and manage all your generated cover images.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                 <Card key={i} className="glass-card flex flex-col overflow-hidden">
                    <CardContent className="p-0">
                        <Skeleton className="aspect-[3/4] w-full" />
                    </CardContent>
                    <div className="p-4 border-t">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </Card>
            ))}
        </div>
      )}

      {!isLoading && covers && covers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {covers.map((item) => (
            <CoverCard key={item.id} item={item as any} />
          ))}
        </div>
      )}

      {!isLoading && (!covers || covers.length === 0) && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven't generated any covers yet.</p>
          <Button variant="link" asChild>
            <a href="/generate">Start creating an e-book to generate a cover</a>
          </Button>
        </div>
      )}
    </div>
  );
}

