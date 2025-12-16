
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const EbookChapterSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const chapterPrompt = ai.definePrompt({
  name: 'generateChapter',
  input: {
    schema: z.object({
      bookTitle: z.string(),
      chapterTitle: z.string(),
    }),
  },
  output: {
    schema: z.object({
      content: z.string(),
    }),
  },
  prompt: `
SYSTEM:
You are a professional nonfiction author.

WRITE ONE FULL CHAPTER.

BOOK:
"{bookTitle}"

CHAPTER:
"{chapterTitle}"

RULES:
- 900–1200 words
- NO placeholders
- NO mock content
- Use headings, steps, bullet points
- Practical, professional tone
- Similar quality to Synthesise.ai output

FAIL IF YOU CANNOT WRITE FULL CONTENT.

BEGIN.
`,
});


export const generateChapterFlow = ai.defineFlow(
    {
        name: 'generateChapterFlow',
        inputSchema: z.object({
            bookTitle: z.string(),
            chapterTitle: z.string(),
        }),
        outputSchema: z.object({
            title: z.string(),
            content: z.string(),
        }),
    },
    async (input) => {
        const { output } = await chapterPrompt(input);
        return {
            title: input.chapterTitle,
            content: output!.content,
        };
    }
);
