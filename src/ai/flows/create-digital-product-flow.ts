'use server';

/**
 * @fileOverview This flow generates a complete digital product (e-book content and SVG cover)
 * in a single API call based on a user-provided topic.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { DigitalProductSchema, TopicSchema } from '@/lib/types';
import type { DigitalProduct, Topic } from '@/lib/types';

const productCreationPrompt = ai.definePrompt({
  name: 'digitalProductGenerator',
  input: { schema: TopicSchema },
  output: { schema: DigitalProductSchema },
  prompt: `
You are an expert author and designer, tasked with creating a complete digital product in a single step.
Based on the user's topic, you must generate a full e-book and a corresponding SVG cover design.

**User Topic:**
"{{topic}}"

---

**E-BOOK REQUIREMENTS:**
- **Tone:** Modern, motivational, clear, and engaging.
- **Structure:**
  - **Title:** A catchy, marketable title.
  - **Introduction:** An engaging intro explaining why this topic is important right now.
  - **Chapters:** 8 to 12 detailed, easy-to-read chapters. Each chapter must have a title and comprehensive content.
  - **Conclusion:** A summary of key takeaways.
  - **Call to Action:** A final, compelling call to action for the reader.
- **Formatting:** All e-book content (intro, chapters, conclusion, etc.) should be formatted in markdown.

---

**SVG COVER REQUIREMENTS:**
- **Format:** A single, complete, valid SVG string.
- **Dimensions:** 1200x1600 pixels.
- **Style:** A "glassmorphic" gradient design. It should feel modern, clean, and premium.
- **Content:**
  - **Title:** The exact title of the e-book you generated.
  - **Subtitle:** A 1-2 sentence summary of the introduction you wrote.
  - **Footer:** A small text element at the bottom that reads exactly: "Boss OS AI • 2025".
- **Rules:**
  - Do NOT use any external images or raster graphics (e.g., <image> tags with hrefs).
  - Use web-safe fonts available in SVG, like 'Inter', 'Helvetica', 'Arial', sans-serif.
  - The entire design must be vector-based, using shapes, gradients, and text elements.
  - Use linear gradients and semi-transparent shapes to achieve the glassmorphism effect.

---

**Final Output:**
Respond with a single, valid JSON object that strictly adheres to the output schema. Ensure the 'coverSvg' field contains the complete SVG code as a string.
`,
});

export async function createDigitalProduct(
  input: Topic
): Promise<DigitalProduct> {
  const { output } = await productCreationPrompt(input);
  if (!output) {
    throw new Error('Failed to generate the digital product. The AI model did not return a valid output.');
  }
  return output;
}

ai.defineFlow(
  {
    name: 'createDigitalProductFlow',
    inputSchema: TopicSchema,
    outputSchema: DigitalProductSchema,
  },
  createDigitalProduct
);
