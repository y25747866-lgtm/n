
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { EbookChapterSchema } from '@/lib/types';

const ChapterGenerationInput = z.object({
  topic: z.string().describe('The main topic or title of the book.'),
  chapterTitle: z
    .string()
    .describe('The specific title of the chapter to be written.'),
});

const chapterPrompt = ai.definePrompt(
  {
    name: 'generateChapterPrompt',
    input: { schema: ChapterGenerationInput },
    output: { schema: EbookChapterSchema },
    prompt: `
SYSTEM:
You are an expert author. Your task is to write a single, complete chapter for an e-book.

STRICT RULES:
- This is NOT a preview or a summary.
- The content must be a full, well-researched chapter of 800-1200 words.
- Write in a clear, engaging, and professional tone.
- Do NOT repeat the chapter title in the content.
- Structure the content with paragraphs. Do not use markdown.

BOOK TOPIC:
"{topic}"

CHAPTER TO WRITE:
"{chapterTitle}"

YOUR TASK:
Write the full content for the chapter specified above.

OUTPUT JSON ONLY:
{
  "title": "{chapterTitle}",
  "content": "The full, complete text of the chapter, between 800 and 1200 words..."
}

BEGIN.
`,
    config: {
      maxOutputTokens: 4096,
      temperature: 0.7,
    },
  },
);

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
    return output;
  }
);

export async function generateChapter(input: z.infer<typeof ChapterGenerationInput>) {
  return generateChapterFlow(input);
}
