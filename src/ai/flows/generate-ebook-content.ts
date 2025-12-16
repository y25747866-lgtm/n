
'use server';
import { ai } from '@/ai/genkit';
import { EbookContentSchema } from '@/lib/types';
import { z } from 'zod';

export const ebookContentPrompt = ai.definePrompt({
  name: 'generateFullEbook',
  input: {
    schema: z.object({
      topic: z.string(),
      title: z.string(),
      chapters: z.array(z.string()),
    }),
  },
  output: {
    schema: EbookContentSchema,
  },
  prompt: `
SYSTEM: You are a professional nonfiction author creating a REAL commercial ebook. Your output will be SOLD to customers.

STRICT RULES (NO EXCEPTIONS):
- NO placeholder text
- NO mock content
- NO summaries pretending to be chapters
- If you cannot complete a section, you MUST still write it fully
- NEVER say "not implemented", "placeholder", or similar

BOOK TITLE: "{title}"

TOPIC: "{topic}"

CHAPTERS: {chapters}

TASK:
- Write ALL chapters in full
- Each chapter: 800–1200 words
- Professional structure (headings, bullets, steps, examples)
- Then write a REAL conclusion (500–700 words)

OUTPUT FORMAT (JSON ONLY):
{
  "title": "{title}",
  "chapters": [
    { "title": "Chapter title", "content": "FULL REAL CONTENT" }
  ],
  "conclusion": "FULL REAL CONCLUSION",
  "estimated_pages": 30
}

FAIL THE TASK IF CONTENT IS NOT REAL.

BEGIN.
`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 8192,
  },
});
