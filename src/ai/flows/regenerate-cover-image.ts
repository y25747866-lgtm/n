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
import { PlaceHolderImages } from '@/lib/placeholder-images';

const RegenerateCoverImageInputSchema = z.object({
  topic: z.string().describe('The topic or niche of the product.'),
  coverStyle: z.string().describe('The desired style of the cover image (e.g., Minimal, Photo, Illustrated).'),
  seed: z.string().optional().describe('An optional seed value to use for the image generation. If not specified, a new seed will be generated.'),
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
        // Use a random seed for picsum to get a new image
        const seed = input.seed || Math.floor(Math.random() * 1000);
        placeholder = { imageUrl: `https://picsum.photos/seed/${seed}/600/800` };
    }

    const imageUrl = placeholder?.imageUrl || `https://picsum.photos/seed/fallback-regenerate/600/800`;

    // To ensure variation even for matching styles, we can append a random query param
    const finalUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}v=${Math.random()}`;

    return { coverImageUrl: finalUrl };
  }
);
