
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OutlineSchema = z.object({
  title: z.string().describe('The main title of the e-book.'),
  subtitle: z.string().describe('A brief, catchy subtitle for the e-book.'),
  chapters: z
    .array(z.string())
    .min(10, 'E-book must have at least 10 chapters.')
    .describe('An array of 10-12 chapter titles.'),
});

export const outlinePrompt = ai.definePrompt({
  name: 'generateBookOutline',
  input: { schema: z.object({ topic: z.string() }) },
  output: {
    schema: OutlineSchema,
  },
  prompt: `
SYSTEM:
Generate a PROFESSIONAL ebook outline.

RULES:
- User gives ONLY topic
- YOU generate title
- YOU generate subtitle
- YOU generate 10–12 chapter titles
- NO content yet, just the titles.

TOPIC:
"{topic}"

OUTPUT JSON:
{
  "title": "Book title",
  "subtitle": "Subtitle",
  "chapters": [
    "Chapter 1 title",
    "Chapter 2 title"
  ]
}
`,
});

export const generateOutlineFlow = ai.defineFlow(
  {
    name: 'generateOutlineFlow',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: OutlineSchema,
  },
  async (input) => {
    const { output } = await outlinePrompt(input);
    if (!output) {
      throw new Error('Failed to generate outline.');
    }
    return output;
  }
);

export async function generateOutline(input: { topic: string }) {
  return generateOutlineFlow(input);
}
