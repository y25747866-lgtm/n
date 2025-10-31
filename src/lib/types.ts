
import { z } from 'zod';

// Form & Generation Config
export const GenerationConfigSchema = z.object({
  topic: z.string().min(10),
  authorName: z.string().optional(),
  productType: z.enum(['ebook', 'course', 'template']),
  tone: z.enum(['professional', 'casual', 'persuasive']),
  length: z.number(),
  coverStyle: z.enum(['gradient', 'minimalist']),
  suggestPrice: z.boolean(),
  imageModel: z.string(),
});
export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;


// E-book Content Generation
export const EbookGenerationConfigSchema = GenerationConfigSchema.pick({
    topic: true,
    authorName: true,
    productType: true,
    tone: true,
    length: true,
});
export const EbookContentSchema = z.object({
  bookTitle: z.string(),
  bookContent: z.string(),
  suggestedPrice: z.string().optional(),
});
export type EbookContent = z.infer<typeof EbookContentSchema> & {
    coverImageUrl?: string;
    coverImagePrompt?: string;
};


// Cover Image Generation
export const CoverGenerationConfigSchema = z.object({
  topic: z.string(),
  style: z.string(),
  title: z.string(),
  author: z.string(),
  imageModel: z.string(),
});
export type CoverGenerationConfig = z.infer<typeof CoverGenerationConfigSchema>;


// Cover Image Regeneration
export const CoverRegenerationConfigSchema = z.object({
  prompt: z.string(),
  imageModel: z.string(),
});
export type CoverRegenerationConfig = z.infer<typeof CoverRegenerationConfigSchema>;


// Result Schemas
export const CoverImageResultSchema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
});
export type CoverImageResult = z.infer<typeof CoverImageResultSchema>;


// UI State
export type JobStatus = 'pending' | 'running' | 'completed' | 'error';

    
    