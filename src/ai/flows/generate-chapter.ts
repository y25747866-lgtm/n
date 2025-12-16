
'use server';

import { ai } from '@/ai/genkit';
import { EbookChapterSchema } from '@/lib/types';
import { z } from 'zod';

const chapterPrompt = ai.definePrompt({
  name: 'generateFullChapter',
  input: {
    schema: z.object({
      bookTitle: z.string(),
      chapterTitle: z.string(),
      topic: z.string(),
    }),
  },
  output: {
    schema: EbookChapterSchema,
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

const generateChapterFlow = ai.defineFlow(
  {
    name: 'generateChapterFlow',
    inputSchema: z.object({
      bookTitle: z.string(),
      chapterTitle: z.string(),
      topic: z.string(),
    }),
    outputSchema: EbookChapterSchema,
  },
  async (input) => {
    console.log("🧠 Generating chapter:", input.chapterTitle);
    const { output } = await chapterPrompt(input);
    return output!;
  }
);

export async function generateChapter(input: z.infer<typeof chapterPrompt.inputSchema>) {
    return await generateChapterFlow(input);
}
