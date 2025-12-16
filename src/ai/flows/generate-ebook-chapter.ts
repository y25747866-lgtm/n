'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const EbookChapterSchema = z.object({
  content: z.string().describe("The full text content of the chapter."),
});

export type EbookChapter = z.infer<typeof EbookChapterSchema>;

const ebookChapterPrompt = ai.definePrompt({
  name: 'generateEbookChapter',
  input: {
    schema: z.object({
      bookTitle: z.string(),
      chapterTitle: z.string(),
    }),
  },
  output: {
    schema: EbookChapterSchema,
  },
  prompt: `
SYSTEM:
You are a professional ebook writer.

TASK:
Write ONE full chapter for a professional non-fiction ebook.

BOOK TITLE:
"{bookTitle}"

CHAPTER TITLE:
"{chapterTitle}"

RULES:
- Length: 800–1000 words
- Use headings, bullet points, steps, examples
- Clear, actionable, professional tone
- NO filler text
- NO placeholders

OUTPUT:
Return ONLY the chapter content as plain text.

BEGIN.
`,
});

export async function generateEbookChapter(input: z.infer<typeof ebookChapterPrompt.input.schema>): Promise<EbookChapter> {
    const {output} = await ebookChapterPrompt(input);
    return output!;
}
