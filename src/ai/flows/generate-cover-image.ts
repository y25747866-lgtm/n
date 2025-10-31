
'use server';

/**
 * @fileOverview A flow for generating a cover image for a digital product.
 *
 * - generateCoverImage - Generates an image URL.
 * - CoverGenerationConfigSchema - Input schema for the flow.
 * - CoverImageResultSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import {
  CoverGenerationConfigSchema,
  CoverImageResultSchema,
} from '@/lib/types';
import type { CoverGenerationConfig, CoverImageResult } from '@/lib/types';

export async function generateCoverImage(
  input: CoverGenerationConfig
): Promise<CoverImageResult> {
  const imagePrompt = `Generate a one-of-a-kind 3D cover with a random gradient, premium modern texture, and minimalist design for an e-book titled "${input.title}". The style should be ${input.style}. The topic is ${input.topic}. Ensure typography is bold and readable from a thumbnail. Include a subtle abstract geometric icon. No faces or copyrighted characters.`;

  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: imagePrompt,
    config: {
      aspectRatio: '3:4', // For 1200x1600
    },
  });

  const imageUrl = media?.url;

  if (!imageUrl) {
    throw new Error('Failed to generate cover image.');
  }

  return { imageUrl, prompt: imagePrompt };
}

ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: CoverGenerationConfigSchema,
    outputSchema: CoverImageResultSchema,
  },
  generateCoverImage
);

    