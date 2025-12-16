
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const conclusionPrompt = ai.definePrompt({
  name: 'generateConclusion',
  input: {
    schema: z.object({
      bookTitle: z.string(),
      topic: z.string(),
    }),
  },
  output: { schema: z.string() },
  prompt: `
Write a full professional conclusion (600–800 words)
for the ebook "{bookTitle}" about "{topic}".

NO placeholders.
`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 2000,
  },
});

const generateConclusionFlow = ai.defineFlow(
  {
    name: 'generateConclusionFlow',
    inputSchema: z.object({
      bookTitle: z.string(),
      topic: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await conclusionPrompt(input);
    return output!;
  }
);

export async function generateConclusion(input: z.infer<typeof conclusionPrompt.inputSchema>) {
    return await generateConclusionFlow(input);
}
