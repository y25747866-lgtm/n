
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { EbookChapterSchema } from '@/lib/types';

const ChapterGenerationInput = z.object({
  bookTitle: z.string(),
  chapterTitle: z.string(),
  topic: z.string(),
});

const chapterPrompt = ai.definePrompt({
  name: 'generateFullChapter',
  input: {
    schema: ChapterGenerationInput,
  },
  output: {
    schema: EbookChapterSchema
  },
  prompt: `
SYSTEM:
Write a REAL ebook chapter for SALE.

RULES:
- 900–1200 words
- NO placeholders
- NO summaries
- NO preview text
- Must read like a real book chapter

BOOK:
"{bookTitle}"

CHAPTER:
"{chapterTitle}"

TOPIC:
"{topic}"

WRITE THE FULL CHAPTER NOW.
`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 4000,
  },
});

export const generateChapterFlow = ai.defineFlow(
  {
    name: 'generateChapterFlow',
    inputSchema: ChapterGenerationInput,
    outputSchema: EbookChapterSchema,
  },
  async (input) => {
    const { output } = await chapterPrompt(input);
    if (!output) {
      throw new Error(`AI failed to generate chapter content for "${input.chapterTitle}".`);
    }
    // The prompt now outputs the correct schema, but the model might forget to include the title.
    // We'll ensure the title from the input is always present.
    return {
      title: input.chapterTitle,
      content: output.content
    };
  }
);

export async function generateChapter(input: z.infer<typeof ChapterGenerationInput>) {
  return generateChapterFlow(input);
}
