
import { z } from 'zod';

export const GenerationConfigSchema = z.object({
  topic: z.string().min(10, { message: 'Topic must be at least 10 characters long.' }),
  productType: z.string(),
});

export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;


export const TemplateGenerationConfigSchema = z.object({
  topic: z.string().min(5, { message: 'Topic must be at least 5 characters long.' }),
  templateType: z.string(),
});

export type TemplateGenerationConfig = z.infer<typeof TemplateGenerationConfigSchema>;


export const EbookChapterSchema = z.object({
  title: z.string().describe('The title of the chapter.'),
  content: z.string().describe("Full text for the chapter."),
});

export const EbookContentSchema = z.object({
  title: z.string().describe('The main title of the e-book.'),
  subtitle: z.string().optional().describe('A brief, catchy subtitle.'),
  chapters: z
    .array(EbookChapterSchema)
    .min(1, 'E-book must have at least one chapter.')
    .describe('An array of chapter objects, each containing a title and content.'),
  conclusion: z.string().describe("Final summary and action steps"),
  coverImageUrl: z.string().optional().describe("URL for the generated cover image"),
  estimated_pages: z.number().optional(),
});

export type EbookContent = z.infer<typeof EbookContentSchema>;

export const EbookOutlineSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    chapters: z.array(z.string()),
});

export type EbookOutline = z.infer<typeof EbookOutlineSchema>;

export const TemplateContentSchema = z.object({
    id: z.string().optional(),
    productType: z.literal('Template').optional(),
    title: z.string().describe("The main title of the template."),
    content: z.string().describe("The full text content of the template, formatted with markdown."),
    generationDate: z.string().optional(),
});

export type TemplateContent = z.infer<typeof TemplateContentSchema>;


export type JobStatus = 'pending' | 'running' | 'completed' | 'error';
