
'use server';
/**
 * @fileOverview AI flow for generating ebook content and cover images.
 *
 * - generateEbookFlow: The main flow function that orchestrates content and cover generation.
 * - EbookGenerationInput: The Zod schema for the input parameters.
 * - EbookContent: The Zod schema for the structured output of the ebook.
 */

import { ai } from '@/ai/genkit';
import { EbookContentSchema, EbookGenerationInput } from '@/lib/types';
import { z } from 'zod';
import { generateGradientSVG } from '@/lib/svg-utils';

// Define the prompt for generating the ebook content.
// This prompt instructs the AI to return a structured JSON object.
const ebookWriterPrompt = ai.definePrompt({
  name: 'ebookWriterPrompt',
  input: { schema: EbookGenerationInput },
  output: { schema: EbookContentSchema },
  prompt: `You are an expert author and digital product creator. A user wants to create an ebook about the following topic: {{{topic}}}.

  Your task is to generate the complete content for this ebook, including a title, subtitle, and at least 3 chapters with detailed content. The content should be engaging, well-structured, and provide real value to the reader.

  Finally, provide a conclusion that summarizes the key takeaways and provides a call to action.

  Please format your response as a JSON object that conforms to the following schema:
  
  """json
  {
    "title": "The main title of the e-book.",
    "subtitle": "A brief, catchy subtitle.",
    "chapters": [
      {
        "title": "The title of the chapter.",
        "content": "Full text for the chapter, formatted in markdown."
      }
    ],
    "conclusion": "Final summary and action steps."
  }
  """`,
  // Configure the model and settings for the generation.
  config: {
    model: 'gemini-1.5-pro-latest',
    temperature: 0.8,
    output: {
      format: 'json',
    },
  },
});

// Define the main flow for ebook generation.
export const generateEbookFlow = ai.defineFlow(
  {
    name: 'generateEbookFlow',
    inputSchema: EbookGenerationInput,
    outputSchema: EbookContentSchema,
  },
  async (input) => {
    // Generate the ebook content by invoking the writer prompt.
    const { output: ebookContent } = await ebookWriterPrompt(input);

    if (!ebookContent) {
      throw new Error('Failed to generate ebook content.');
    }

    // Generate a placeholder SVG cover image.
    // In a real application, you might use a more advanced image generation model here.
    const coverImageUrl = generateGradientSVG(ebookContent.title, ebookContent.subtitle || '', input.topic.toLowerCase().split(' ')[0]);

    // Return the combined result.
    return {
      ...ebookContent,
      coverImageUrl,
    };
  }
);
