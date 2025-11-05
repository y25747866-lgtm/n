
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
  title: z.string().describe('The title of the chapter.'),
  content: z.string().describe("Full text (approx 600-900 words per chapter), include examples, steps, bullet lists, and 1 short case study or actionable task."),
});

const QualityCheckSchema = z.object({
  readability_score: z.string().describe("short note why this is easy-to-read"),
  uniqueness_note: z.string().describe("short note ensuring unique content"),
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
    .describe('An array of chapter objects, each containing a title and content.'),
  conclusion: z.string().describe("Final summary and 3 action steps"),
  estimated_pages: z
    .number()
    .describe('An estimated page count for the generated e-book, must be between 40 and 50.'),
  cover_prompt: z.string().describe("One-line prompt describing a premium gradient glass cover for the book."),
  quality_check: QualityCheckSchema,
  keywords: z.array(z.string()).optional().describe("An array of 3-5 relevant lowercase keywords for searching."),
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

    