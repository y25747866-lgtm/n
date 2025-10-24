'use server';

/**
 * @fileOverview Ebook content generation flow.
 *
 * - generateEbookContent - A function that generates ebook content based on a topic and parameters.
 * - GenerateEbookContentInput - The input type for the generateEbookContent function.
 * - GenerateEbookContentOutput - The return type for the generateEbookContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEbookContentInputSchema = z.object({
  topic: z.string().describe('The topic or niche of the ebook.'),
  productType: z.enum([
    'Ebook',
    'Course Script',
    'Checklist',
    'Template',
    'Journal',
    'Worksheet',
    'Printable',
  ]).describe('The type of product to generate.'),
  tone: z.enum(['Casual', 'Professional', 'Persuasive']).describe('The tone of the ebook.'),
  length: z
    .enum(['Short', 'Medium', 'Long'])
    .describe('The desired length of the ebook (Short 5-10p, Medium 20-40p, Long 40-100p).'),
  optionalPriceSuggestion: z.boolean().optional().describe('Whether to include a price suggestion in the ebook.'),
});
export type GenerateEbookContentInput = z.infer<typeof GenerateEbookContentInputSchema>;

const GenerateEbookContentOutputSchema = z.object({
  title: z.string().describe('The title of the generated ebook content.'),
  chapters: z.array(
    z.object({
      title: z.string().describe('The title of the chapter.'),
      content: z.string().describe('The content of the chapter.'),
    })
  ).describe('The chapters of the generated ebook content.'),
});
export type GenerateEbookContentOutput = z.infer<typeof GenerateEbookContentOutputSchema>;

export async function generateEbookContent(
  input: GenerateEbookContentInput
): Promise<GenerateEbookContentOutput> {
  return generateEbookContentFlow(input);
}

const generateEbookContentPrompt = ai.definePrompt({
  name: 'generateEbookContentPrompt',
  input: {schema: GenerateEbookContentInputSchema},
  output: {schema: GenerateEbookContentOutputSchema},
  prompt: `You are an AI ebook writer. Your goal is to create an ebook with high quality content, that is engaging and informative.

  Topic: {{{topic}}}
  Product Type: {{{productType}}}
  Tone: {{{tone}}}
  Length: {{{length}}}

  Instructions:
  - Create a title for the ebook.
  - Write the content for each chapter based on the topic, product type, tone and length.
  - The ebook should be well-structured and easy to read.
  {{#if optionalPriceSuggestion}}
  - Include a price suggestion based on the length and content of the ebook.
  {{/if}}
  `,
});

const generateEbookContentFlow = ai.defineFlow(
  {
    name: 'generateEbookContentFlow',
    inputSchema: GenerateEbookContentInputSchema,
    outputSchema: GenerateEbookContentOutputSchema,
  },
  async input => {
    const {output} = await generateEbookContentPrompt(input);
    return output!;
  }
);
