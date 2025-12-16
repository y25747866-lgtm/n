
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConclusionInputSchema = z.object({
    topic: z.string().describe("The main topic/title of the book."),
    bookTitle: z.string().describe("The main topic/title of the book."),
    chapterTitles: z.array(z.string()).describe("The list of chapter titles in the book.")
});

const ConclusionOutputSchema = z.object({
    content: z.string().describe("The full content of the conclusion, between 600-800 words.")
});


export const conclusionPrompt = ai.definePrompt({
  name: 'conclusionPrompt',
  input: { schema: ConclusionInputSchema },
  output: { schema: ConclusionOutputSchema },
  prompt: `
Write a full professional conclusion (600–800 words)
for the ebook "{bookTitle}" about "{topic}".

NO placeholders.
`,
  config: {
    maxOutputTokens: 2048,
    temperature: 0.7,
  },
});


export const generateConclusionFlow = ai.defineFlow(
  {
    name: 'generateConclusionFlow',
    inputSchema: ConclusionInputSchema,
    outputSchema: ConclusionOutputSchema,
  },
  async (input) => {
    const { output } = await conclusionPrompt(input);
    if (!output) {
      throw new Error('Failed to generate conclusion.');
    }
    return output;
  }
);

export async function generateConclusion(input: z.infer<typeof ConclusionInputSchema>) {
    const result = await generateConclusionFlow(input);
    return result.content;
}
