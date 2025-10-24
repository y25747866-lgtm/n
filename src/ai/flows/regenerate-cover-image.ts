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
  coverStyle: z.string().describe('The desired style of the cover image (e.g., Minimal, Photo, Illustrated).'),
  seed: z.string().optional().describe('An optional seed value to use for the image generation.  If not specified, a new seed will be generated.'),
});
export type RegenerateCoverImageInput = z.infer<typeof RegenerateCoverImageInputSchema>;

const RegenerateCoverImageOutputSchema = z.object({
  coverImageUrl: z.string().describe('The URL of the newly generated cover image.'),
});
export type RegenerateCoverImageOutput = z.infer<typeof RegenerateCoverImageOutputSchema>;

export async function regenerateCoverImage(input: RegenerateCoverImageInput): Promise<RegenerateCoverImageOutput> {
  return regenerateCoverImageFlow(input);
}

const regenerateCoverImagePrompt = ai.definePrompt({
  name: 'regenerateCoverImagePrompt',
  input: {schema: RegenerateCoverImageInputSchema},
  output: {schema: RegenerateCoverImageOutputSchema},
  prompt: `You are an AI cover image generator for Boss OS. Based on the topic, generate a cover image URL, based on the cover style.  The URL will point to an image that matches the style and topic.

Topic: {{{topic}}}
Cover Style: {{{coverStyle}}}

Return a JSON object with the key \"coverImageUrl\" containing the URL of the generated cover image.
`, // Added description for JSON output
});

const regenerateCoverImageFlow = ai.defineFlow(
  {
    name: 'regenerateCoverImageFlow',
    inputSchema: RegenerateCoverImageInputSchema,
    outputSchema: RegenerateCoverImageOutputSchema,
  },
  async input => {
    const {output} = await regenerateCoverImagePrompt(input);
    return output!;
  }
);
