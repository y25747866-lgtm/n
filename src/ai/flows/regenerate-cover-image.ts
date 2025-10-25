'use server';
/**
 * @fileOverview Regenerates a cover image for a product.
 *
 * - regenerateCoverImage - A function that handles the cover image regeneration process.
 * - RegenerateCoverImageInput - The input type for the regenerateCoverImage function.
 * - RegenerateCoverImageOutput - The return type for the regenerateCoverImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateCoverImageInputSchema = z.object({
  topic: z.string().describe('The topic or niche of the product.'),
  title: z.string().describe('The title of the ebook.'),
  authorName: z.string().describe("The author's name."),
  coverStyle: z.string().describe('The desired style of the cover image (e.g., Minimal, Photo, Illustrated).'),
  imageModel: z.enum([
    'googleai/gemini-2.5-flash-image-preview',
    'googleai/imagen-4.0-fast-generate-001',
  ]).describe('The image generation model to use.'),
});
export type RegenerateCoverImageInput = z.infer<typeof RegenerateCoverImageInputSchema>;

const RegenerateCoverImageOutputSchema = z.object({
  coverImageUrl: z.string().describe('The URL of the newly generated cover image.'),
});
export type RegenerateCoverImageOutput = z.infer<typeof RegenerateCoverImageOutputSchema>;

export async function regenerateCoverImage(input: RegenerateCoverImageInput): Promise<RegenerateCoverImageOutput> {
  return regenerateCoverImageFlow(input);
}

const regenerateCoverImageFlow = ai.defineFlow(
  {
    name: 'regenerateCoverImageFlow',
    inputSchema: RegenerateCoverImageInputSchema,
    outputSchema: RegenerateCoverImageOutputSchema,
  },
  async (input) => {
     const { media } = await ai.generate({
      model: input.imageModel,
      prompt: `Regenerate a new, different version of a realistic, high-quality ebook cover.
      The cover must include the following text elements:
      - Title: "${input.title}"
      - Author: "${input.authorName}"
      
      The overall topic is "${input.topic}".
      The desired style is "${input.coverStyle}".
      
      Make sure this new version is visually distinct from any previous versions.

      The final output should be just the image, with the text beautifully integrated into the design.`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });
    
    if (!media.url) {
      throw new Error('Image regeneration failed to return a URL.');
    }

    return { coverImageUrl: media.url };
  }
);
