
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
  coverStyle: z.enum([
    'Realistic',
    '3D',
    'Minimal',
    'Premium Gradient',
  ]).describe('The desired style of the cover image (e.g., Minimal, Photo, Illustrated).'),
  imageModel: z.string().describe('The image generation model to use.').default('googleai/imagen-4.0-fast-generate-001'),
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
      prompt: `Generate a new, different version of a professional and visually appealing ebook cover. It must be visually distinct from any previous version.

**Instructions:**
1.  **Theme:** The cover's design should be based on the topic: **"${input.topic}"**.
2.  **Style:** The visual style must be **"${input.coverStyle}"**.
3.  **Text Elements:** The following text must be clearly legible and beautifully integrated into the design:
    *   **Title:** "${input.title}"
    *   **Author:** "${input.authorName}"
4.  **Composition:** This is for a book cover, so the layout and composition should be professional. Do not just generate a background image. The text and design must work together as a cohesive cover. Ensure all text is spelled correctly and is fully visible on the cover.
5.  **Output:** The final output must be only the complete cover image. Do not include any extra text or descriptions outside of the image itself.`,
    });
    
    if (!media.url) {
      throw new Error('Image regeneration failed to return a URL.');
    }

    return { coverImageUrl: media.url };
  }
);
