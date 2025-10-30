
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
  authorName: z.string().describe("The author's name to be placed on the cover."),
  coverStyle: z.enum([
    'Realistic',
    '3D',
    'Minimal',
    'Premium Gradient',
  ]).describe('The desired style for the cover image.'),
  imageModel: z.string().describe('The image generation model to use.').default('googleai/imagen-4.0-fast-generate-001'),
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
    const { media } = await ai.generate({
      model: input.imageModel,
      prompt: `Generate a professional and visually appealing ebook cover.

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
      throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl: media.url };
  }
);
