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
import { PlaceHolderImages } from '@/lib/placeholder-images';

const GenerateCoverImageInputSchema = z.object({
  topic: z.string().describe('The topic of the ebook.'),
  title: z.string().describe('The title of the ebook to be placed on the cover.'),
  authorName: z.string().describe("The author's name to be placed on the cover."),
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
    // Select a placeholder image based on the cover style
    let placeholder;
    switch (input.coverStyle.toLowerCase()) {
      case 'minimal':
        placeholder = PlaceHolderImages.find(p => p.id === 'cover-minimal');
        break;
      case 'photo':
        placeholder = PlaceHolderImages.find(p => p.id === 'cover-photo');
        break;
      case 'illustrated':
        placeholder = PlaceHolderImages.find(p => p.id === 'cover-illustrated');
        break;
      default:
         // Default to a random picsum image if no specific style matches
        const seed = Math.floor(Math.random() * 1000);
        placeholder = { imageUrl: `https://picsum.photos/seed/${seed}/600/800` };
    }

    const imageUrl = placeholder?.imageUrl || 'https://picsum.photos/seed/fallback/600/800';

    return {imageUrl};
  }
);
