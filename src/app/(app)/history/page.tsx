
'use client';

import { useCollection, useFirebase } from '@/firebase';
import { collection, orderBy, query, doc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Download, FileText, History, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EbookContent, TemplateContent } from '@/lib/types';
import { downloadFile } from '@/lib/download';
import { useState } from 'react';
import { useMemoFirebase } from '@/firebase/provider';
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
import { generatePdfAction } from '@/app/actions/generate-pdf-action';
import { generateCoverAction } from '@/app/actions/generate-cover-action';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function HistoryItemCard({ item }: { item: EbookContent & { id: string, productType: string, generationDate: string, coverImageUrl?: string } }) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverUrl, setCoverUrl] = useState(item.coverImageUrl);

  const handleDownload = async () => {
    setIsDownloading(true);
    toast({ title: "Generating PDF...", description: "This might take a moment." });
    try {
      const pdfBase64 = await generatePdfAction(item);
      const blob = new Blob([Buffer.from(pdfBase64, 'base64')], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
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

  const handleDelete = async () => {
    if (!firestore || !user) return;
    setIsDeleting(true);
    try {
        const q = query(collection(firestore, 'users', user.uid, 'generatedProducts'), where("id", "==", item.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docToDelete = querySnapshot.docs[0];
            await deleteDoc(docToDelete.ref);
            toast({
                title: "Item Deleted",
                description: `"${item.title}" has been removed from your history.`,
            });
        }
    } catch (error) {
        console.error("Error deleting document: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the item. Please try again.",
        });
    } finally {
        setIsDeleting(false);
    }
  };

  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    toast({ title: "Generating Cover...", description: "The AI is designing your cover." });
    try {
      const { imageUrl } = await generateCoverAction(item.title, item.subtitle || '');
      setCoverUrl(imageUrl);
      // Here you would also update the document in Firestore with the new coverUrl
    } catch (error) {
      console.error("Error generating cover:", error);
      toast({ variant: "destructive", title: "Cover Generation Failed", description: "Could not generate the cover image." });
    } finally {
      setIsGeneratingCover(false);
    }
  };


  return (
    <Card className="glass-card flex flex-col">
      <CardHeader className="pb-2">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md mb-4 border">
            {isGeneratingCover ? (
                <Skeleton className="h-full w-full" />
            ) : coverUrl ? (
                <Image src={coverUrl} alt={`Cover for ${item.title}`} fill className="object-cover" />
            ) : (
                 <div className="h-full w-full bg-secondary flex flex-col items-center justify-center text-center p-4">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No cover generated</p>
                 </div>
            )}
        </div>
        <CardTitle className="flex items-center gap-2 text-lg leading-tight">
            {item.productType === 'Ebook' ? <Book className="h-5 w-5 text-primary shrink-0" /> : <FileText className="h-5 w-5 text-primary shrink-0" />}
            <span className="flex-1 truncate">{item.title}</span>
        </CardTitle>
        <CardDescription>
            {new Date(item.generationDate).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Badge variant="secondary">{item.productType}</Badge>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
         <div className="flex w-full gap-2">
            <Button className="flex-1" variant="outline" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
        <Button className="w-full" variant="secondary" onClick={handleGenerateCover} disabled={isGeneratingCover}>
            {isGeneratingCover ? <Loader2 className="animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            {coverUrl ? 'Regenerate Cover' : 'Generate Cover'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function HistoryPage() {
  const { firestore, user } = useFirebase();
  
  const historyCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'generatedProducts');
  }, [firestore, user]);

  const historyQuery = useMemoFirebase(() => {
    if (!historyCollectionRef) return null;
    return query(historyCollectionRef, orderBy('generationDate', 'desc'));
  }, [historyCollectionRef]);

  const { data: history, isLoading } = useCollection(historyQuery);

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
                    <CardHeader className="pb-2">
                        <Skeleton className="aspect-[3/4] w-full rounded-md mb-4" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Skeleton className="h-6 w-1/4" />
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

    