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
  prompt: `You are an AI ebook writer. Your task is to generate a complete and structured 40-50 page ebook based on the user's specifications.

**Ebook Specifications:**
- **Topic:** {{{topic}}}
- **Author:** {{{authorName}}}
- **Product Type:** {{{productType}}}
- **Tone:** {{{tone}}}
- **Target Length:** {{{length}}} (translate this to a 40-50 page book)

**Ebook Structure Requirements:**
You must generate the content for the following sections in order, as separate chapters in the output array:

1.  **Title Page:**
    - Create a compelling title and a subtitle.
    - Include the author's name: {{{authorName}}}.
    - Format this as the first "chapter" with the title "Title Page".

2.  **Table of Contents:**
    - Generate a table of contents listing all chapters.
    - Format this as the second "chapter" with the title "Table of Contents".

3.  **Introduction:**
    - Write an introduction to the ebook.
    - This should be the first numbered chapter.

4.  **Main Chapters:**
    - Generate 5-7 main chapters covering the core topic.
    - Each chapter must be well-structured with professional formatting.
    - Use Markdown for formatting: use headings (#, ##), sub-headings (###), bullet points (*), numbered lists, bold text, and italics.
    - Include practical examples, summaries, or key takeaways in each chapter to enhance value.

5.  **Conclusion:**
    - Write a concluding chapter that summarizes the key points of the ebook.
    - Provide a call to action or final thoughts.

6.  **About the Author:**
    - Write a brief, placeholder "About the Author" section for {{{authorName}}}.

{{#if optionalPriceSuggestion}}
- **Final Chapter: Price Suggestion:** Include a final chapter with a suggested market price for this ebook, based on its content, length, and topic.
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
