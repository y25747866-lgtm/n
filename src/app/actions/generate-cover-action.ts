
'use server';

import { openrouter } from '@/lib/openrouter';
import { generateGradientSVG } from '@/lib/svg-utils';

const USE_REAL_AI_COVER = false; // Set to true to use DALL-E (costs credits)

export async function generateCoverAction(title: string, subtitle: string) {
  if (!USE_REAL_AI_COVER) {
     // For development, return a programmatically generated SVG cover to save costs.
     const svgDataUrl = generateGradientSVG(title, subtitle, 'ai');
     return { imageUrl: svgDataUrl };
  }

  try {
    const coverPrompt = `
      Create a professional, visually stunning e-book cover for a book titled "${title}".
      Subtitle: "${subtitle}".
      Style requirements:
      - Design aesthetic: Minimalist, modern, and abstract.
      - Color Palette: Use a sophisticated gradient of deep blues and purples.
      - Imagery: Avoid literal objects or people. Focus on abstract geometric shapes, subtle textures, or light effects.
      - Typography: The title should be the main focus, using a clean, bold, sans-serif font. The subtitle should be smaller and less prominent.
      - Composition: Centered and well-balanced.
      - DO NOT include any text, titles, or words on the image itself. The text will be added later.
      - Final output must be a clean image with no text.
    `;

    const response = await openrouter.images.generate({
      model: 'openai/dall-e-3',
      prompt: coverPrompt,
      n: 1,
      size: '1024x1792', // Standard e-book cover aspect ratio
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      throw new Error('AI did not return an image URL.');
    }

    return { imageUrl };
  } catch (error) {
    console.error('AI COVER ERROR:', error);
    throw new Error('Failed to generate the cover image.');
  }
}

    