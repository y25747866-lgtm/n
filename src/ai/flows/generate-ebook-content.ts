
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
  authorName: z.string().describe("The author's name for the title page."),
  productType: z.enum([
    'Ebook',
    'Course',
    'Template',
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
      content: z.string().describe('The content of the chapter, formatted with markdown.'),
    })
  ).describe('The chapters of the generated ebook content, including Title Page, Table of Contents, and Conclusion.'),
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
  prompt: `You are an AI ebook writer. Your task is to generate a compelling outline and introduction for an ebook based on the user's specifications.

**Ebook Specifications:**
- **Topic:** {{{topic}}}
- **Author:** {{{authorName}}}
- **Product Type:** {{{productType}}}
- **Tone:** {{{tone}}}
- **Target Length:** {{{length}}}

**Output Structure Requirements:**
You must generate the content for the following sections in order, as separate chapters in the output array:

1.  **Title Page:**
    - Create a compelling title and a subtitle.
    - Include the author's name: {{{authorName}}}.
    - Format this as the first "chapter" with the title "Title Page". Its content should just be the title, subtitle, and author name formatted with markdown newlines.

2.  **Table of Contents (Outline):**
    - Generate a detailed table of contents listing a logical flow of chapters for the book. This serves as the book's outline.
    - Include an Introduction, 5-7 main chapters, and a Conclusion.
    - Format this as the second "chapter" with the title "Table of Contents". The content should be a markdown list.

3.  **Introduction:**
    - Write a full introduction for the ebook based on the topic.
    - This should be the third "chapter" with the title "Introduction".

{{#if optionalPriceSuggestion}}
4.  **Price Suggestion:** 
    - Include a final chapter with a suggested market price for this ebook, based on its content, length, and topic.
    - Provide a short rationale for the price.
{{/if}}

Ensure the final output is a single JSON object that strictly follows the output schema.
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
