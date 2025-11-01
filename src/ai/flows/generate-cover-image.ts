
'use server';

/**
 * @fileOverview A flow for generating a cover image for a digital product.
 *
 * - generateCoverImage - Generates an image URL or a fallback SVG.
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
  const imagePrompt = `Generate an original premium gradient glass e-book cover for TITLE: '${input.title}' SUBTITLE: '${input.subtitle}'. Style: modern, minimalist, bold typography, no faces.`;

  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
      config: {
        aspectRatio: '3:4', // For 1200x1600
      },
    });

    const imageUrl = media?.url;

    if (!imageUrl) {
      throw new Error('Image model did not return a URL.');
    }

    return { imageUrl, prompt: imagePrompt, status: 'generated' };
  } catch (error) {
    console.error('Real image generation failed, creating SVG fallback:', error);
    // If image generation fails (key error, quota, etc.), return SVG fallback.
    const fallbackSvgUrl = generateGradientSVG(input.title, input.subtitle);
    return {
      imageUrl: fallbackSvgUrl,
      prompt: imagePrompt, // Still return the prompt for potential future regeneration
      status: 'placeholder',
    };
  }
}

ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: CoverGenerationConfigSchema,
    outputSchema: CoverImageResultSchema,
  },
  generateCoverImage
);
