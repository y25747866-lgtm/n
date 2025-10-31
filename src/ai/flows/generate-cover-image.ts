
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
import { generateGradientSVG } from '@/lib/svg-utils';

export async function generateCoverImage(
  input: CoverGenerationConfig
): Promise<CoverImageResult> {
  
  const imageUrl = generateGradientSVG(input.title, input.topic);
  
  // The prompt is no longer generated, so we return a placeholder.
  const prompt = `A generated SVG cover for the book titled '${input.title}'.`;

  return { imageUrl, prompt };
}

ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: CoverGenerationConfigSchema,
    outputSchema: CoverImageResultSchema,
  },
  generateCoverImage
);
