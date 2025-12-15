
'use server';
/**
 * @fileOverview E-book Content Generation Flow
 *
 * This file defines the Genkit flow for generating the content of a non-fiction e-book.
 * - `generateEbookContent`: The main flow function.
 * - `EbookContentSchema`: The Zod schema for the flow's output.
 */

import { ai } from '@/ai/genkit';
import { EbookContentSchema, type GenerationConfig } from '@/lib/types';
import { z } from 'zod';

const EbookGenerationPrompt = ai.definePrompt({
  name: 'ebookGenerationPrompt',
  input: { schema: GenerationConfigSchema },
  output: { schema: EbookContentSchema },
  prompt: `
You are a professional digital product creator and book author.

You MUST do ALL of the following automatically:
- Decide the best ebook TITLE by yourself
- Decide the best SUBTITLE by yourself
- Write a complete non-fiction ebook
- Aim for a PDF length of 30-40 pages
- Each chapter must have real, useful, actionable content
- Use clear, beginner-friendly language
- No filler or placeholder text
- Do not mention AI in the output
- Maintain a professional tone

You must ALSO generate:
- A short but detailed PROMPT for an AI image generator to create a premium ebook cover
- The cover prompt should specify a modern, clean, professional design suitable for selling online.

VERY IMPORTANT:
- Output ONLY valid JSON that conforms to the provided schema.
- Do NOT add explanations, extra text, or markdown wrapping.
- Do NOT add comments in the JSON.

Your input is a topic: {{{topic}}}
`,
});

export const generateEbookContent = ai.defineFlow(
  {
    name: 'generateEbookContent',
    inputSchema: GenerationConfigSchema,
    outputSchema: EbookContentSchema,
  },
  async (config) => {
    const { output } = await EbookGenerationPrompt(config);
    if (!output) {
      throw new Error('Failed to generate ebook content: AI returned no output.');
    }
    return output;
  }
);
