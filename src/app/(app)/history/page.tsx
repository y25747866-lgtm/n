
'use client';

import { useCollection, useFirebase } from '@/firebase';
import { collection, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Download, FileText, History, Loader2, Trash2 } from 'lucide-react';
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

function HistoryItemCard({ item }: { item: any }) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    // This will be replaced with a link to a server-generated file.
    toast({
      title: "Download Not Implemented",
      description: "Server-side PDF generation is coming soon!",
    });
  };

  const handleDelete = async () => {
    if (!firestore || !user) return;
    setIsDeleting(true);
    try {
      const docRef = doc(firestore, 'users', user.uid, 'generatedProducts', item.id);
      await deleteDoc(docRef);
      toast({
        title: "Item Deleted",
        description: `"${item.title}" has been removed from your history.`,
      });
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


  return (
    <Card className="glass-card flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {item.productType === 'Ebook' ? <Book className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
            <span className="flex-1 truncate">{item.title}</span>
        </CardTitle>
        <CardDescription>
            {new Date(item.generationDate).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Badge variant="secondary">{item.productType}</Badge>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
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
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && history && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => (
            <HistoryItemCard key={item.id} item={item} />
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
