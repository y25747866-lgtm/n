
'use client';

import { useCollection, useFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Download, FileText, History, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EbookContent, TemplateContent } from '@/lib/types';
import { downloadFile } from '@/lib/download';
import { generateLongEbookPDF } from '@/lib/pdf-generator';
import { useMemo } from 'react';
import { useMemoFirebase } from '@/firebase/provider';

function HistoryItemCard({ item }: { item: any }) {

  const handleDownload = async () => {
    if (item.productType === 'Ebook') {
      const ebook = item as EbookContent;
      try {
        const pdfBytes = await generateLongEbookPDF(
          ebook.title,
          ebook.chapters,
          ebook.conclusion
        );
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${ebook.title.slice(0, 20).replace(/\s+/g, '_')}_ebook.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (e: any) {
        console.error(`Failed to create PDF: ${e.message}`);
      }
    } else if (item.productType === 'Template') {
        const template = item as TemplateContent;
        downloadFile(template.content, `${template.title.replace(/\s+/g, '_')}.txt`, 'text/plain');
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {item.productType === 'Ebook' ? <Book className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
            <span className="flex-1 truncate">{item.title}</span>
        </CardTitle>
        <CardDescription>
            {new Date(item.generationDate).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{item.productType}</Badge>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
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
