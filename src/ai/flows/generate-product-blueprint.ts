
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const EbookBlueprintSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  chapters: z.array(z.string()),
});

export type EbookBlueprint = z.infer<typeof EbookBlueprintSchema>;

export const productBlueprintPrompt = ai.definePrompt({
  name: 'generateProductBlueprint',
  input: {
    schema: z.object({
      topic: z.string(),
    }),
  },
  output: {
    schema: EbookBlueprintSchema,
  },
  prompt: `
SYSTEM: You are a premium SaaS digital product generator like Synthesise.ai.

RULES:
- User gives ONLY a topic
- YOU generate the book title
- Title must be suitable for a professional ebook
- NO placeholders

TOPIC: "{topic}"

OUTPUT (JSON):
{
  "title": "Strong, professional ebook title",
  "subtitle": "Clear outcome-driven subtitle",
  "chapters": [
    "Chapter 1 title",
    "Chapter 2 title",
    "... (10–12 total)"
  ]
}

BEGIN.
`,
});

export const generateProductBlueprint = ai.defineFlow(
  {
    name: 'generateProductBlueprint',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: EbookBlueprintSchema,
  },
  async (input) => {
    const { output } = await productBlueprintPrompt(input);
    return output!;
  }
);
