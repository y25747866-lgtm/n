
'use server';
/**
 * @fileOverview A flow for generating e-book content and tracking topic trends.
 *
 * - generateEbookContent - Generates title/content and updates the topic's usage count in Firestore.
 * - GenerationConfigSchema - Input schema for the flow.
 * - EbookContentSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { EbookContentSchema, GenerationConfigSchema } from '@/lib/types';
import type { EbookContent, GenerationConfig } from '@/lib/types';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const EbookContentGenerationInputSchema = z.object({
    topic: z.string(),
});

const contentGenerationPrompt = ai.definePrompt({
  name: 'generateEbookPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: EbookContentGenerationInputSchema },
  output: { schema: EbookContentSchema },
  prompt: `
SYSTEM: You are an expert book-writer & editor. Produce a full, high-quality non-fiction ebook suitable for 40–50 printed pages on the requested topic. Do not include any "as an AI" text.

INPUT:
- TOPIC: "{topic}"
- TARGET_LENGTH_PAGES: 40-50
- CHAPTER_COUNT: 10-12

OUTPUT FORMAT (JSON):
{
  "title": "Book Title",
  "subtitle": "1-line subtitle",
  "author": "Boss OS AI",
  "table_of_contents": [ "Chapter 1 Title", ... ],
  "chapters": [
    { "title": "Chapter 1 Title", "content": "Full text (approx 600-900 words per chapter), include examples, steps, bullet lists, and 1 short case study or actionable task." },
    ...
  ],
  "conclusion": "Final summary and 3 action steps",
  "estimated_pages": 45,                 // must be between 40 and 50
  "cover_prompt": "One-line prompt describing a premium gradient glass cover for the book: ...",
  "quality_check": {
     "readability_score": "short note why this is easy-to-read",
     "uniqueness_note": "short note ensuring unique content"
  },
  "keywords": ["keyword1", "keyword2", "keyword3"] // Array of 3-5 relevant lowercase keywords for searching
}

REQUIREMENTS:
- Each chapter should be actionable. Use examples, numbered steps, and bullet lists.
- Keep readable paragraphs (3–6 sentences). Use headings and subheadings.
- Avoid repeating sentences. Use varied vocabulary.
- Make tone: professional, motivational, practical.
- Ensure total output approximates 40–50 pages (10–12 chapters * ~600–900 words each).
- Generate an array of 3-5 relevant, lowercase keywords related to the topic for search indexing.

Begin generation now.
`,
  config: {
    temperature: 0.8,
  }
});

async function trackTopicTrend(topic: string, keywords: string[]) {
  if (!firestore) return;
  const topicId = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const topicRef = doc(firestore, 'trending_topics', topicId);

  try {
    await runTransaction(firestore, async (transaction) => {
      const topicDoc = await transaction.get(topicRef);
      if (!topicDoc.exists()) {
        transaction.set(topicRef, {
          topic: topic,
          usage_count: 1,
          last_month_usage_count: 0, // New topics have no previous history
          lastUpdated: serverTimestamp(),
          keywords: keywords,
        });
      } else {
        const newCount = (topicDoc.data().usage_count || 0) + 1;
        transaction.update(topicRef, {
          usage_count: newCount,
          lastUpdated: serverTimestamp(),
          keywords: keywords, // Also update keywords in case they change
          last_month_usage_count: topicDoc.data().last_month_usage_count || 0, // Preserve existing last month count
        });
      }
    });
  } catch (error) {
    console.error("Failed to update topic trend:", error);
    // Non-critical error, so we don't re-throw. The content generation can still succeed.
  }
}

export async function generateEbookContent(
  input: GenerationConfig
): Promise<EbookContent> {
  const { output } = await contentGenerationPrompt({ topic: input.topic });
  if (!output) {
    throw new Error('Failed to generate e-book content.');
  }
  
  // Track the trend in Firestore, but don't block the response
  trackTopicTrend(input.topic, output.keywords || []);

  return output;
}

ai.defineFlow(
  {
    name: 'generateEbookContentFlow',
    inputSchema: GenerationConfigSchema,
    outputSchema: EbookContentSchema,
  },
  generateEbookContent
);

    