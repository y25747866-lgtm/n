
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import UnifiedProgressModal from '@/components/boss-os/unified-progress-modal';
import { type GenerationConfig, type EbookContent } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  topic: z.string().min(10, 'Please enter a topic with at least 10 characters.'),
  authorName: z.string().optional(),
  productType: z.enum(['ebook', 'course', 'template']).default('ebook'),
  tone: z.enum(['professional', 'casual', 'persuasive']).default('professional'),
  length: z.number().min(20).max(100).default(40),
  coverStyle: z.enum(['gradient', 'photorealistic', '3d', 'minimalist']).default('gradient'),
  suggestPrice: z.boolean().default(true),
});

export default function GeneratePage() {
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig | null>(null);
  const [generatedContent, setGeneratedContent] = useState<EbookContent | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      authorName: 'Boss User',
      productType: 'ebook',
      tone: 'professional',
      length: 40,
      coverStyle: 'gradient',
      suggestPrice: true,
    },
  });

  const { isSubmitting } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    setGeneratedContent(null);
    setGenerationConfig({ ...values, imageModel: 'dall-e-3' });
  }

  const lengthLabels: { [key: number]: string } = {
    20: 'Very Short (≈20p)',
    40: 'Medium (≈20-40p)',
    60: 'Long (≈40-60p)',
    80: 'Very Long (≈60-80p)',
    100: 'Book (80-100p+)',
  };

  const coverStyleImage = (style: string) =>
    PlaceHolderImages.find(
      (p) => p.id === `cover-${style.replace('photorealistic', 'photo')}`
    )?.imageUrl || '/placeholder.png';

  return (
    <>
      {generationConfig && (
        <UnifiedProgressModal
          config={generationConfig}
          onComplete={(content) => {
            setGeneratedContent(content);
            setGenerationConfig(null);
          }}
          onClose={() => setGenerationConfig(null)}
        />
      )}

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl space-y-8">
        <header>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
            <Wand2 className="h-10 w-10 text-primary" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">
              Digital Product Generator
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Fill out the details below to generate a unique digital product with AI.
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Generation Parameters</CardTitle>
                <CardDescription>
                  Provide the AI with the details it needs to create your product.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Topic / Niche</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'A beginner's guide to investing in cryptocurrency'"
                          {...field}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormDescription>
                        This is the core subject of your digital product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'John Doe'" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name that will appear on the cover and title page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="ebook">Ebook</SelectItem>
                          <SelectItem value="course">Course</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Length: {lengthLabels[field.value]}
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={20}
                          max={100}
                          step={20}
                          onValueChange={(value) => field.onChange(value[0])}
                          defaultValue={[field.value]}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverStyle"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Cover Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                  <SelectTrigger className="h-14">
                                      <div className="flex items-center gap-3">
                                          <Image src={coverStyleImage(field.value)} width={40} height={40} alt={field.value} className="rounded-sm object-cover" />
                                          <SelectValue placeholder="Select a cover style" />
                                      </div>
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="gradient">
                                      <div className="flex items-center gap-3">
                                          <Image src={coverStyleImage('gradient')} width={24} height={24} alt="Premium Gradient" className="rounded-sm object-cover" />
                                          Premium Gradient
                                      </div>
                                  </SelectItem>
                                  <SelectItem value="photorealistic">
                                      <div className="flex items-center gap-3">
                                          <Image src={coverStyleImage('photorealistic')} width={24} height={24} alt="Realistic" className="rounded-sm object-cover" />
                                          Realistic
                                      </div>
                                  </SelectItem>
                                  <SelectItem value="3d">
                                      <div className="flex items-center gap-3">
                                          <Image src={coverStyleImage('3d')} width={24} height={24} alt="3D" className="rounded-sm object-cover" />
                                          3D
                                      </div>
                                  </SelectItem>
                                  <SelectItem value="minimalist">
                                      <div className="flex items-center gap-3">
                                          <Image src={coverStyleImage('minimalist')} width={24} height={24} alt="Minimal" className="rounded-sm object-cover" />
                                          Minimal
                                      </div>
                                  </SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="suggestPrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Price Suggestion</FormLabel>
                        <FormDescription>
                          Let AI suggest a market price for your product.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <Button
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg px-8 bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end text-white hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </>
  );
}
