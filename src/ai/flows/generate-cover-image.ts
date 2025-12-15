
'use server';
/**
 * @fileOverview Cover Image Generation Flow
 *
 * This file defines the Genkit flow for generating an e-book cover image.
 * - `generateCoverImage`: The main flow function.
 * - `CoverGenerationInputSchema`: The Zod schema for the flow's input.
 * - `CoverGenerationOutputSchema`: The Zod schema for the flow's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the input schema for the cover generation flow
export const CoverGenerationInputSchema = z.object({
  topic: z.string(),
  style: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
});
export type CoverGenerationInput = z.infer<typeof CoverGenerationInputSchema>;

// Define the output schema for the cover generation flow
export const CoverGenerationOutputSchema = z.object({
  imageUrl: z.string().url(),
  prompt: z.string(),
});
export type CoverGenerationOutput = z.infer<typeof CoverGenerationOutputSchema>;


const CoverPromptGenerator = ai.definePrompt({
    name: 'coverPromptGenerator',
    input: { schema: CoverGenerationInputSchema },
    output: { schema: z.string() },
    prompt: `
    Generate a concise, artistic, and effective DALL-E 3 prompt to create an ebook cover.

    The cover should be:
    - Style: {{{style}}}
    - Title: "{{{title}}}"
    - Topic: {{{topic}}}
    
    The prompt should be a single, descriptive paragraph. Do not include the title or author in the prompt itself. Focus on the visual elements.
    Example: "A minimalist digital art cover for an ebook titled 'The Art of Focus'. An abstract, single continuous line in a vibrant blue color forms a stylized human brain on a dark navy blue background. The overall aesthetic is clean, modern, and professional."
    `
});


// Define the main flow for generating the cover image
export const generateCoverImage = ai.defineFlow(
  {
    name: 'generateCoverImage',
    inputSchema: CoverGenerationInputSchema,
    outputSchema: CoverGenerationOutputSchema,
  },
  async (input) => {
    
    // 1. Generate a good image prompt from the basic inputs
    const { output: generatedPrompt } = await CoverPromptGenerator(input);
    if (!generatedPrompt) {
        throw new Error("Failed to generate an image prompt.");
    }
    
    // 2. Use the generated prompt to create the image
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: generatedPrompt,
      config: {
        aspectRatio: '3:4',
      }
    });

    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error('Image generation failed to return a valid URL.');
    }

    return {
      imageUrl,
      prompt: generatedPrompt,
    };
  }
);
