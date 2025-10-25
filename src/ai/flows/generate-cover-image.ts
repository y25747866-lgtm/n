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
  title: z.string().describe('The title of the ebook to be placed on the cover.'),
  authorName: z.string().describe('The author\'s name to be placed on the cover.'),
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

const generateCoverImageFlow = ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: GenerateCoverImageInputSchema,
    outputSchema: GenerateCoverImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a realistic, high-quality ebook cover.
The cover must include the following text clearly visible:
- Title: "${input.title}"
- Author: "${input.authorName}"

The overall theme and topic is: "${input.topic}".
The desired artistic style is: "${input.coverStyle}".

The image should be a downloadable, high-quality image.
`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate cover image.');
    }
    return {imageUrl: media.url};
  }
);
