'use server';

/**
 * @fileOverview Flow for generating a cover image for an ebook.
 *
 * - generateCoverImage - A function that handles the cover image generation process.
 * - GenerateCoverImageInput - The input type for the generateCoverImage function.
 * - GenerateCoverImageOutput - The return type for the generateCoverImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverImageInputSchema = z.object({
  topic: z.string().describe('The topic of the ebook.'),
  coverStyle: z.enum([
    'Minimal',
    'Photo',
    'Illustrated',
    'Bold Title',
    'Modern',
  ]).describe('The desired style for the cover image.'),
});
export type GenerateCoverImageInput = z.infer<typeof GenerateCoverImageInputSchema>;

const GenerateCoverImageOutputSchema = z.object({
  imageUrl: z.string().describe('URL of the generated cover image.'),
});
export type GenerateCoverImageOutput = z.infer<typeof GenerateCoverImageOutputSchema>;

export async function generateCoverImage(input: GenerateCoverImageInput): Promise<GenerateCoverImageOutput> {
  return generateCoverImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverImagePrompt',
  input: {schema: GenerateCoverImageInputSchema},
  output: {schema: GenerateCoverImageOutputSchema},
  prompt: `You are an AI cover image generator for ebooks.

  Generate a cover image for an ebook with the following characteristics:

  Topic: {{{topic}}}
  Style: {{{coverStyle}}}

  The image URL MUST be a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.`,
});

const generateCoverImageFlow = ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: GenerateCoverImageInputSchema,
    outputSchema: GenerateCoverImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a cover image for an ebook with the following characteristics:\n\nTopic: ${input.topic}\nStyle: ${input.coverStyle}`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate cover image.');
    }
    return {imageUrl: media.url};
  }
);
