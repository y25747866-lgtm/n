'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const EbookBlueprintSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  chapters: z.array(z.string()),
  cover_prompt: z.string(),
  product_type: z.enum(['ebook', 'course']),
  estimated_pages: z.number(),
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
SYSTEM:
You are a premium digital product architect like Synthesise.ai.

RULES (STRICT):
- User provides ONLY a topic
- YOU generate the title
- YOU generate 10–12 chapter titles
- NO chapter content here
- NO mock text
- Professional SaaS-grade output only

TOPIC:
"{topic}"

OUTPUT (JSON ONLY):
{
  "title": "Professional ebook title",
  "subtitle": "Clear outcome-driven subtitle",
  "chapters": ["Chapter 1 title", "..."],
  "product_type": "ebook",
  "estimated_pages": 30,
  "cover_prompt": "Premium ebook cover, modern SaaS design, unique color palette based on topic, abstract illustration, no photos, no black-only themes, clean typography, professional, minimal"
}

IMPORTANT:
- Chapters MUST be 10–12
- Estimated pages MUST be 20–50
- Cover prompt MUST be UNIQUE per topic

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
