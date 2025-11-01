
import { z } from 'zod';

export const GenerationConfigSchema = z.object({
  topic: z.string().min(10, { message: 'Topic must be at least 10 characters long.' }),
  productType: z.string(),
  tone: z.string(),
  length: z.string(),
  coverStyle: z.string(),
  authorName: z.string().optional(),
});

export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;

export const EbookContentSchema = z.object({
  bookTitle: z.string().describe('A compelling and marketable title for the e-book.'),
  bookContent: z.string().describe('The full body of the e-book, formatted in markdown, including intro, 5-8 chapters, and conclusion.'),
  coverImageUrl: z.string().optional().describe('URL for the generated cover image.'),
  coverImagePrompt: z.string().optional().describe('The prompt used to generate the cover image.'),
});

export type EbookContent = z.infer<typeof EbookContentSchema>;

export const CoverGenerationConfigSchema = z.object({
  title: z.string(),
  topic: z.string(),
  style: z.string(),
  author: z.string(),
});

export type CoverGenerationConfig = z.infer<typeof CoverGenerationConfigSchema>;

export const CoverImageResultSchema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
});

export type CoverImageResult = z.infer<typeof CoverImageResultSchema>;

export const CoverRegenerationConfigSchema = z.object({
    prompt: z.string(),
});

export type CoverRegenerationConfig = z.infer<typeof CoverRegenerationConfigSchema>;


export const JobStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'error',
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;
