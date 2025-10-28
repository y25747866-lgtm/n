
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'next/navigation';
import React from 'react';


import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { SubscriptionGate } from '@/components/boss-os/subscription-gate';
import { useSubscription } from '@/contexts/subscription-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  UnifiedProgressModal,
  GenerationParams,
} from '@/components/boss-os/unified-progress-modal';

const formSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters.'),
  authorName: z.string().min(2, "Author's name must be at least 2 characters."),
  productType: z.enum([
    'Ebook',
    'Course',
    'Template',
  ]),
  tone: z.enum(['Casual', 'Professional', 'Persuasive']),
  length: z.enum(['Short', 'Medium', 'Long']),
  coverStyle: z.enum([
    'Realistic',
    '3D',
    'Minimal',
    'Premium Gradient',
  ]),
  optionalPriceSuggestion: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const productTypes: FormData['productType'][] = [
  'Ebook',
  'Course',
  'Template',
];
const tones: FormData['tone'][] = ['Casual', 'Professional', 'Persuasive'];
const coverStyles: FormData['coverStyle'][] = [
  'Realistic',
  '3D',
  'Minimal',
  'Premium Gradient',
];

const lengthValueMap: Record<FormData['length'], number> = {
  Short: 0,
  Medium: 50,
  Long: 100,
};

const numberToLength = (value: number): FormData['length'] => {
  if (value < 25) return 'Short';
  if (value < 75) return 'Medium';
  return 'Long';
};

const lengthDisplayMap: Record<FormData['length'], string> = {
  Short: 'Short (5-10p)',
  Medium: 'Medium (20-40p)',
  Long: 'Long (40-100p)',
};

function GeneratePageContent() {
  const { subscription } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationData, setGenerationData] = useState<GenerationParams | null>(
    null
  );
  const searchParams = useSearchParams();
  const topicFromUrl = searchParams.get('topic');

  const isSubscribed = subscription.status === 'active';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: topicFromUrl || '',
      authorName: 'Boss User',
      productType: 'Ebook',
      tone: 'Professional',
      length: 'Medium',
      coverStyle: 'Realistic',
      optionalPriceSuggestion: false,
    },
  });

  useEffect(() => {
    if (topicFromUrl) {
      form.setValue('topic', topicFromUrl);
    }
  }, [topicFromUrl, form]);

  function onSubmit(values: FormData) {
    if (!isSubscribed) return;
    setGenerationData({
        ...values,
        imageModel: 'googleai/imagen-4.0-fast-generate-001'
    });
    setIsGenerating(true);
  }

  const watchedLength = form.watch('length');

  return (
    <>
      <div className="space-y-8">
        {!isSubscribed && <SubscriptionGate />}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Generate Product
            </h1>
            <p className="text-muted-foreground">
              Fill in the details to create your next digital asset.
            </p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic / Niche</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'Beginner's Guide to Sourdough Baking'"
                          {...field}
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
                        <Input placeholder="e.g., 'Jane Doe'" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name that will appear on the cover and title page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tone" />
                            </Trigger>
                          </FormControl>
                          <SelectContent>
                            {tones.map((tone) => (
                              <SelectItem key={tone} value={tone}>
                                {tone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Length: {lengthDisplayMap[watchedLength]}
                      </FormLabel>
                      <FormControl>
                        <Slider
                          value={[lengthValueMap[field.value]]}
                          onValueChange={(vals) =>
                            field.onChange(numberToLength(vals[0]))
                          }
                          step={50}
                          max={100}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                  <FormField
                    control={form.control}
                    name="coverStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Style</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a cover style" />
                            </Trigger>
                          </FormControl>
                          <SelectContent>
                            {coverStyles.map((style) => (
                              <SelectItem key={style} value={style}>
                                {style}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="optionalPriceSuggestion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Price Suggestion</FormLabel>
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

                <div className="flex justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <Button
                            type="submit"
                            size="lg"
                            className="bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end text-white"
                            disabled={
                              !isSubscribed || form.formState.isSubmitting
                            }
                          >
                            <Wand2 className="mr-2 h-5 w-5" />
                            Generate
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!isSubscribed && (
                        <TooltipContent>
                          <p>Subscribe to a plan to enable generation.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      {isGenerating && generationData && (
        <UnifiedProgressModal
          isOpen={isGenerating}
          onClose={() => setIsGenerating(false)}
          generationParams={generationData}
        />
      )}
    </>
  );
}

export default function GeneratePage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <GeneratePageContent />
    </React.Suspense>
  );
}
