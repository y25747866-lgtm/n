
'use server';

import { ai } from '@/ai/genkit';
import { EbookOutlineSchema } from '@/lib/types';
import { z } from 'zod';

const outlinePrompt = ai.definePrompt(
  {
    name: 'generateEbookOutline',
    input: { schema: z.object({ topic: z.string() }) },
    output: { schema: EbookOutlineSchema },
    prompt: `
Generate a compelling book outline for the topic: "{topic}".

Include:
- A catchy, SEO-friendly title
- A concise, engaging subtitle
- 5-7 distinct chapter titles that form a logical progression for a complete book.
- The chapter titles should be descriptive and intriguing.

DO NOT generate chapter content, just the titles.
`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  },
);

const generateOutlineFlow = ai.defineFlow(
  {
    name: 'generateOutlineFlow',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: EbookOutlineSchema,
  },
  async (input) => {
    const { output } = await outlinePrompt(input);
    return output!;
  }
);

export async function generateOutline(topic: string) {
    return await generateOutlineFlow({ topic });
}
