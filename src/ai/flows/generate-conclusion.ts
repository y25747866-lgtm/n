
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConclusionInputSchema = z.object({
    topic: z.string().describe("The main topic/title of the book."),
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
SYSTEM:
You are an expert author tasked with writing the conclusion for an e-book.

STRICT RULES:
- The conclusion must be comprehensive and well-written, 600-800 words.
- It should summarize the key takeaways from the chapters.
- It should provide a strong concluding statement or call to action.
- Do NOT just list the chapter titles. Synthesize the ideas.

BOOK TOPIC:
"{topic}"

CHAPTERS IN THE BOOK:
{{#each chapterTitles}}
- {{this}}
{{/each}}

YOUR TASK:
Write a full, compelling conclusion for the e-book.

OUTPUT JSON ONLY:
{
  "content": "The full, complete text of the conclusion..."
}

BEGIN.
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
    return generateConclusionFlow(input);
}
