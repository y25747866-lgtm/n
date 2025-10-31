
'use server';
/**
 * @fileOverview A flow for regenerating a cover image from a given prompt.
 *
 * - regenerateCoverImage - Generates a new image URL from an existing prompt.
 * - CoverRegenerationConfigSchema - Input schema for the flow.
 * - CoverImageResultSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import {
  CoverImageResultSchema,
  CoverRegenerationConfigSchema,
} from '@/lib/types';
import type {
  CoverImageResult,
  CoverRegenerationConfig,
} from '@/lib/types';

export async function regenerateCoverImage(
  input: CoverRegenerationConfig
): Promise<CoverImageResult> {
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: input.prompt,
    config: {
        aspectRatio: '3:4',
    }
  });

  const imageUrl = media?.url;

  if (!imageUrl) {
    throw new Error('Failed to regenerate cover image.');
  }

  return { imageUrl, prompt: input.prompt };
}

ai.defineFlow(
  {
    name: 'regenerateCoverImageFlow',
    inputSchema: CoverRegenerationConfigSchema,
    outputSchema: CoverImageResultSchema,
  },
  regenerateCoverImage
);

    