
'use server';

/**
 * This flow is deprecated and will be removed in a future version.
 * E-book and cover generation are now handled by separate, parallel flows
 * initiated by the UnifiedProgressModal component.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const DeprecatedTopicSchema = z.object({
  topic: z.string(),
});

const DeprecatedDigitalProductSchema = z.object({
  ebookContent: z.string(),
  coverSvg: z.string(),
});

export async function createDigitalProduct() {
  throw new Error(
    'createDigitalProduct is deprecated. Use generateEbookContent and generateCoverImage flows instead.'
  );
}

ai.defineFlow(
  {
    name: 'createDigitalProductFlow',
    inputSchema: DeprecatedTopicSchema,
    outputSchema: DeprecatedDigitalProductSchema,
  },
  createDigitalProduct
);
