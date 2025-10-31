
'use server';
/**
 * @fileOverview A flow for regenerating a cover image from a given prompt.
 *
 * - regenerateCoverImage - Generates a new image URL from an existing prompt.
 * - CoverRegenerationConfigSchema - Input schema for the flow.
 * - CoverImageResultSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  CoverImageResultSchema,
  CoverRegenerationConfigSchema,
} from '@/lib/types';
import type {
  CoverImageResult,
  CoverRegenerationConfig,
} from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';


// We need to parse the title and topic from the prompt to regenerate the SVG.
function parsePrompt(prompt: string): { title: string, topic: string } {
    const titleMatch = prompt.match(/titled '(.*?)'/);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    // This is a placeholder as the original topic is not in the prompt.
    const topic = "A digital product by Boss OS";
    return { title, topic };
}

export async function regenerateCoverImage(
  input: CoverRegenerationConfig
): Promise<CoverImageResult> {
  
  const { title, topic } = parsePrompt(input.prompt);
  const imageUrl = generateGradientSVG(title, topic);

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
