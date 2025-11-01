
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

export const EbookChapterSectionSchema = z.object({
  heading: z.string().describe('The heading of the section.'),
  content: z.string().describe('The markdown content of the section.'),
});

export const EbookChapterSchema = z.object({
  chapter_title: z.string().describe('The title of the chapter.'),
  sections: z
    .array(EbookChapterSectionSchema)
    .describe('An array of sections within the chapter.'),
});

export const EbookContentSchema = z.object({
  title: z.string().describe('The main title of the e-book.'),
  subtitle: z.string().describe('A brief, catchy subtitle.'),
  author: z.string().describe('The name of the author.'),
  table_of_contents: z
    .array(z.string())
    .describe('An array of chapter titles, forming the table of contents.'),
  chapters: z
    .array(EbookChapterSchema)
    .describe('An array of chapter objects, each containing a title and sections.'),
  estimated_pages: z
    .number()
    describe('An estimated page count for the generated e-book, typically between 40 and 50.'),
  coverImageUrl: z.string().optional().describe('URL for the generated cover image.'),
  coverImagePrompt: z.string().optional().describe('The prompt used to generate the cover image.'),
  cover_status: z.enum(['generated', 'placeholder']).optional().describe('The status of the cover image.'),
});

export type EbookContent = z.infer<typeof EbookContentSchema>;


export const CoverGenerationConfigSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  topic: z.string(),
  style: z.string(),
  author: z.string(),
});

export type CoverGenerationConfig = z.infer<typeof CoverGenerationConfigSchema>;

export const CoverImageResultSchema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
  status: z.enum(['generated', 'placeholder']),
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
