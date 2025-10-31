'use server';

/**
 * @fileOverview This file is deprecated. Use generate-ebook-content and generate-cover-image flows instead.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const CreateDigitalProductInputSchema = z.object({
  topic: z.string().min(5).describe('The central topic for the e-book.'),
  style: z.string().optional().describe('An optional style preference for the cover (e.g., neon, luxury).'),
});

export const CreateDigitalProductOutputSchema = z.object({
  bookTitle: z.string().describe('The generated title of the e-book.'),
  bookContent: z.string().describe('The full content of the e-book, formatted in markdown.'),
  coverImagePrompt: z.string().describe('The generated prompt for creating the e-book cover image.'),
});

export type CreateDigitalProductInput = z.infer<typeof CreateDigitalProductInputSchema>;
export type CreateDigitalProductOutput = z.infer<typeof CreateDigitalProductOutputSchema>;

const productCreationPrompt = ai.definePrompt({
  name: 'createDigitalProductPrompt',
  input: { schema: CreateDigitalProductInputSchema },
  output: { schema: CreateDigitalProductOutputSchema },
  prompt: `
You are an AI system that helps users create complete digital products.
Your tasks are to write a full e-book based on the user's topic and generate a matching, professional cover image prompt.

--- E-BOOK CONTENT ---
The e-book must include:
- A strong title
- A subtitle or tagline
- An engaging introduction
- 4 to 8 detailed chapters
- A short conclusion and call to action

Use clear, professional language. Focus on practical advice, examples, and steps.
Format the entire e-book content as a single markdown string with headings, subheadings, and bullet points.

USER TOPIC: "{{topic}}"

--- COVER IMAGE PROMPT ---
Generate a clean, modern e-book cover concept using the generated book title.
The base prompt structure is:
“Create a premium e-book cover titled ‘{book_title}’. Use a smooth gradient background, bold typography, and an abstract or minimalist icon that reflects the topic. The design should feel high quality and digital-age inspired, suitable for online courses, business guides, or digital hustles.”

{{#if style}}
Incorporate the user's preferred style: "{{style}}".
{{/if}}

--- OUTPUT ---
Provide your response as a single JSON object that strictly follows the output schema, with 'bookTitle', 'bookContent', and 'coverImagePrompt' fields.
`,
});

export async function createDigitalProduct(input: CreateDigitalProductInput): Promise<CreateDigitalProductOutput> {
  const { output } = await productCreationPrompt(input);
  if (!output) {
    throw new Error('Failed to generate digital product.');
  }
  return output;
}

ai.defineFlow(
  {
    name: 'createDigitalProductFlow',
    inputSchema: CreateDigitalProductInputSchema,
    outputSchema: CreateDigitalProductOutputSchema,
  },
  async (input) => {
    return await createDigitalProduct(input);
  }
);
