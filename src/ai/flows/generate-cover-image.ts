
'use server';

/**
 * @fileOverview A flow for generating a cover image and prompt for a digital product.
 *
 * - generateCoverImage - Generates an image URL and the prompt used to create it.
 * - CoverGenerationConfigSchema - Input schema for the flow.
 * - CoverImageResultSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  CoverGenerationConfigSchema,
  CoverImageResultSchema,
} from '@/lib/types';
import type { CoverGenerationConfig, CoverImageResult } from '@/lib/types';

const coverPromptGenerationTemplate = ai.definePrompt({
  name: 'coverPromptGenerator',
  input: { schema: CoverGenerationConfigSchema },
  output: { schema: z.string() },
  prompt: `
    You are an expert prompt engineer for text-to-image AI models.
    Your task is to generate a single, concise, and effective prompt to create a professional e-book cover.

    Base Specifications:
    - Title: "{{title}}"
    - Author: "{{author}}"
    - Core Topic: "{{topic}}"
    - Style: "{{style}}"

    Base Prompt Structure:
    "Create a premium, professional e-book cover for a digital product titled '{{title}}' by {{author}}. The design should be clean, modern, and high-quality, suitable for online courses, business guides, or digital hustles. The central theme is '{{topic}}'."

    Style-Specific Instructions:
    - If style is 'gradient': "Incorporate a smooth, vibrant gradient background with complementary colors. Use bold, elegant typography for the title. Add a single, minimalist abstract icon that visually represents the core topic."
    - If style is 'photorealistic': "Use a high-resolution, professional photograph as the background. The photo should be directly related to '{{topic}}' and have a shallow depth of field. Overlay the title in a clean, sans-serif font. The overall mood should be inspiring and authentic."
    - If style is '3d': "Design a 3D-rendered scene that illustrates the concept of '{{topic}}'. Use a playful but polished aesthetic with soft lighting and a clear composition. The title should be integrated into the 3D scene naturally."
    - If style is 'minimalist': "Design an ultra-minimalist cover with a plain, neutral-colored background. Use a single, elegant sans-serif font for the title. Include one small, simple, and clever graphic element related to the topic. Emphasize negative space."

    Combine the base structure and the relevant style instruction into a single, cohesive prompt. Do not add any extra explanations or text.
    `,
});

export async function generateCoverImage(
  input: CoverGenerationConfig
): Promise<CoverImageResult> {
  const { output: prompt } = await coverPromptGenerationTemplate(input);

  if (!prompt) {
    throw new Error('Failed to generate cover image prompt.');
  }

  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt,
    config: {
        aspectRatio: '9:16'
    }
  });

  const imageUrl = media.url;
  if (!imageUrl) {
    throw new Error('Failed to generate cover image.');
  }

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
