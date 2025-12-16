
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const coverImagePrompt = ai.definePrompt({
  name: 'generateEbookCover',
  input: {
    schema: z.object({
      title: z.string(),
      subtitle: z.string(),
      topic: z.string(),
    }),
  },
  output: {
    schema: z.object({
      image_prompt: z.string(),
    }),
  },
  prompt: `
SYSTEM:
You are a professional ebook cover designer.

TASK:
Generate a SINGLE detailed image prompt for an ebook cover.

STRICT RULES:
- The book TITLE must be visible on the cover
- The SUBTITLE must be visible
- Clean typography
- Abstract illustration (NO photos)
- Unique color palette based on topic
- Modern SaaS / startup style
- White or light background preferred

BOOK TITLE:
"{title}"

SUBTITLE:
"{subtitle}"

TOPIC:
"{topic}"

OUTPUT (ONE LINE ONLY):
"A professional ebook cover design with the title '{title}' and subtitle '{subtitle}' clearly visible in bold modern typography, abstract illustration related to {topic}, premium SaaS style, clean layout, high contrast, no photos"

BEGIN.
`,
});

export const generateCoverImageFlow = ai.defineFlow(
    {
        name: 'generateCoverImageFlow',
        inputSchema: z.object({
            title: z.string(),
            subtitle: z.string(),
            topic: z.string(),
        }),
        outputSchema: z.object({
            imageUrl: z.string(),
        }),
    },
    async (input) => {
        const { output } = await coverImagePrompt(input);
        const imagePrompt = output!.image_prompt;

        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: imagePrompt,
            config: {
                aspectRatio: '3:4',
            },
        });

        return {
            imageUrl: media.url,
        };
    }
);
