
import { z } from 'zod';

export const GenerationConfigSchema = z.object({
  topic: z.string().min(10, { message: 'Topic must be at least 10 characters long.' }),
  productType: z.string(),
  category: z.string(),
});

export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;

export const EbookChapterSchema = z.object({
  title: z.string().describe('The title of the chapter.'),
  content: z.string().describe("Full text for the chapter."),
});

export const EbookContentSchema = z.object({
  title: z.string().describe('The main title of the e-book.'),
  subtitle: z.string().optional().describe('A brief, catchy subtitle.'),
  chapters: z
    .array(EbookChapterSchema)
    .describe('An array of chapter objects, each containing a title and content.'),
  conclusion: z.string().describe("Final summary and action steps"),
  cover_image_prompt: z.string().describe("A short image prompt for a premium ebook cover."),
  coverImageUrl: z.string().optional().describe("URL for the generated cover image"),
});

export type EbookContent = z.infer<typeof EbookContentSchema>;

export type JobStatus = 'pending' | 'running' | 'completed' | 'error';
