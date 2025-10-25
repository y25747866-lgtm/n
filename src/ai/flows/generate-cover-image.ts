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
  imageModel: z.enum([
    'googleai/gemini-2.5-flash-image-preview',
    'googleai/imagen-4.0-fast-generate-001',
    'placeholder',
  ]).describe('The image generation model to use.'),
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
    if (input.imageModel === 'placeholder') {
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
          const seed = Math.floor(Math.random() * 1000);
          placeholder = { imageUrl: `https://picsum.photos/seed/${seed}/600/800` };
      }
      const imageUrl = placeholder?.imageUrl || `https://picsum.photos/seed/fallback/600/800`;
      return { imageUrl };
    }

    const { media } = await ai.generate({
      model: input.imageModel,
      prompt: `Generate a realistic, high-quality ebook cover.
      The cover must include the following text elements:
      - Title: "${input.title}"
      - Author: "${input.authorName}"
      
      The overall topic is "${input.topic}".
      The desired style is "${input.coverStyle}".
      
      The final output should be just the image, with the text beautifully integrated into the design.`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });
    
    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl: media.url };
  }
);
