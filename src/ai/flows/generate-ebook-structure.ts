'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const EbookStructureSchema = z.object({
  title: z.string().describe("Compelling professional ebook title"),
  subtitle: z.string().describe("Clear value-driven subtitle"),
  author: z.string().default("NexoraOS AI"),
  chapters: z.array(z.string()).describe("An array of 10-12 chapter titles"),
  estimated_pages: z.number().describe("An estimated page count between 20 and 50"),
  cover_prompt: z.string().describe("A detailed prompt for a premium, modern ebook cover related to the topic"),
  keywords: z.array(z.string()).describe("An array of relevant keywords for the book"),
});

export type EbookStructure = z.infer<typeof EbookStructureSchema>;

const ebookStructurePrompt = ai.definePrompt({
  name: "generateEbookStructure",
  input: {
    schema: z.object({
      topic: z.string(),
    }),
  },
  output: {
    schema: EbookStructureSchema,
  },
  prompt: `
SYSTEM:
You are a professional non-fiction book strategist and publishing expert.

IMPORTANT RULES:
- The user provides ONLY a topic.
- You MUST generate the book title yourself.
- You MUST generate 10–12 chapter titles.
- The book must be suitable for 20–50 PDF pages.
- Do NOT generate chapter content here.

INPUT:
TOPIC: "{topic}"

OUTPUT (JSON ONLY):
{
  "title": "Compelling professional ebook title",
  "subtitle": "Clear value-driven subtitle",
  "author": "NexoraOS AI",
  "chapters": [
    "Chapter 1 title",
    "Chapter 2 title",
    "..."
  ],
  "estimated_pages": 30,
  "cover_prompt": "Premium professional ebook cover. Modern SaaS style. Unique color palette based on topic. High contrast typography. Visual metaphor related to the topic. No repeated styles. Clean, minimal, high-end.",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

REQUIREMENTS:
- Chapters MUST be 10–12.
- Estimated pages MUST be between 20 and 50.
- Cover prompt MUST change based on topic.
- Tone: professional, premium, modern.

BEGIN NOW.
`,
});

export async function generateEbookStructure(input: z.infer<typeof ebookStructurePrompt.input.schema>): Promise<EbookStructure> {
    const {output} = await ebookStructurePrompt(input);
    return output!;
}
