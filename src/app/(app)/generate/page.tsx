
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Wand2, BookOpen, Download, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { generateEbookAction, ActionResult } from '@/app/actions/generate-ebook-action';
import { EbookContent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ErrorDisplay } from '@/components/boss-os/error-display';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  topic: z.string().min(10, { message: 'Please provide a more detailed topic (at least 10 characters).' }),
  productType: z.string(),
});

type GenerationFormValues = z.infer<typeof formSchema>;

export default function GeneratePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EbookContent | null>(null);

  const form = useForm<GenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      productType: 'Ebook',
    },
  });

  const onSubmit = async (values: GenerationFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const actionResult: ActionResult = await generateEbookAction(values);

    if (actionResult.success) {
      setResult(actionResult.data);
      toast({
        title: 'Generation Complete!',
        description: 'Your new digital product is ready.',
      });
    } else {
      setError(`Generation failed: ${actionResult.error}`);
    }
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    setResult(null);
    setError(null);
    form.reset();
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-primary" />
          <span className="bg-clip-text text-transparent bg-accent-gradient-1">Digital Product Factory</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Turn your ideas into market-ready digital products in minutes. Describe your topic, and let our AI handle the rest.
        </p>
      </header>

      {!result ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Create a New Digital Product</CardTitle>
            <CardDescription>
              Fill out the form below to generate your content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ebook">Ebook</SelectItem>
                          <SelectItem value="Course" disabled>Online Course (Coming Soon)</SelectItem>
                          <SelectItem value="Lead Magnet" disabled>Lead Magnet (Coming Soon)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic / Idea</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'A beginner's guide to investing in cryptocurrency'" {...field} />
                      </FormControl>
                      <FormDescription>
                        Be as specific as you can for the best results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && <ErrorDisplay message={error} />}

                <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Generate Now
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">Your Product is Ready!</CardTitle>
                <CardDescription>Here is your generated ebook. You can download it now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:w-auto rounded-lg overflow-hidden shadow-2xl">
                         {result.coverImageUrl && <Image
                            src={result.coverImageUrl}
                            alt={result.title}
                            fill
                            className="object-cover"
                         />}
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold leading-tight">{result.title}</h2>
                        {result.subtitle && <p className="text-muted-foreground">{result.subtitle}</p>}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Ebook</Badge>
                            <Badge variant="secondary">{result.chapters.length} Chapters</Badge>
                        </div>
                         <Separator />
                        <p className="text-sm text-muted-foreground">
                            {result.conclusion}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleRegenerate}>
                        <RefreshCw />
                        Create Another
                    </Button>
                    <Button disabled>
                        <Download />
                        Download PDF (Soon)
                    </Button>
                </div>

            </CardContent>
        </Card>
      )}
    </div>
  );
}
