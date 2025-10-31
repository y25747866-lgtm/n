
'use server';
/**
 * @fileOverview A flow for generating e-book content based on a detailed configuration.
 *
 * - generateEbookContent - Generates the title and markdown content for an e-book.
 * - EbookGenerationConfigSchema - Input schema for the flow.
 * - EbookContentSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { EbookContentSchema, EbookGenerationConfigSchema } from '@/lib/types';
import type { EbookContent, GenerationConfig } from '@/lib/types';

const contentGenerationPrompt = ai.definePrompt({
  name: 'generateEbookPrompt',
  input: { schema: EbookGenerationConfigSchema },
  output: { schema: EbookContentSchema },
  prompt: `
You are an expert author and digital product creator. Your task is to write a complete e-book based on the user's detailed specifications.

--- USER REQUIREMENTS ---
Topic: "{{topic}}"
Author: "{{authorName}}"
Product Type: "{{productType}}"
Tone: "{{tone}}"
Target Length: Approximately {{length}} pages.

--- E-BOOK STRUCTURE ---
You must generate the following components:
1.  **Book Title:** A compelling and marketable title for the e-book.
2.  **Book Content:** The full body of the e-book, formatted in markdown.

The book content must include:
- A strong title, subtitle, and author name on the first page.
- An engaging introduction that hooks the reader.
- 4 to 8 detailed chapters, each with clear headings. Use subheadings, bullet points, and bold text to structure the content logically.
- A concise conclusion that summarizes the key takeaways and provides a call to action.

--- WRITING STYLE ---
- Language: Use clear, professional language appropriate for the specified '{{tone}}' tone.
- Content: Focus on providing practical, actionable advice, real-world examples, and step-by-step instructions.
- Formatting: Ensure the entire output is a single, valid JSON object that strictly adheres to the output schema. The 'bookContent' field must be a well-formatted markdown string.

Begin generation now.
`,
});

export async function generateEbookContent(
  input: GenerationConfig
): Promise<EbookContent> {
  const { output } = await contentGenerationPrompt(input);
  if (!output) {
    throw new Error('Failed to generate e-book content.');
  }
  return output;
}

ai.defineFlow(
  {
    name: 'generateEbookContentFlow',
    inputSchema: EbookGenerationConfigSchema,
    outputSchema: EbookContentSchema,
  },
  generateEbookContent
);
