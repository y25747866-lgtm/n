
'use server';
/**
 * @fileOverview A flow for generating e-book content and tracking topic trends.
 *
 * - generateEbookContent - Generates title/content and updates the topic's usage count in Firestore.
 * - EbookGenerationConfigSchema - Input schema for the flow.
 * - EbookContentSchema - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { EbookContentSchema, EbookGenerationConfigSchema } from '@/lib/types';
import type { EbookContent, GenerationConfig } from '@/lib/types';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase/server-init';

const contentGenerationPrompt = ai.definePrompt({
  name: 'generateEbookPrompt',
  input: { schema: EbookGenerationConfigSchema },
  output: { schema: EbookContentSchema },
  prompt: `
You are an expert author and digital product creator. Your task is to write a complete e-book based on the user's detailed specifications.

--- USER REQUIREMENTS ---
Topic: "{{topic}}"
Author: "{{authorName}}"
Product Type: "{{productType}}"
Tone: "{{tone}}"
Target Length: Approximately {{length}} pages.

--- E-BOOK STRUCTURE ---
You must generate the following components:
1.  **Book Title:** A compelling and marketable title for the e-book.
2.  **Book Content:** The full body of the e-book, formatted in markdown.

The book content must include:
- A strong title, subtitle, and author name on the first page.
- An engaging introduction that hooks the reader.
- 5 to 8 detailed chapters, each with clear headings. Use subheadings, bullet points, and bold text to structure the content logically.
- A "Key Takeaways" section that summarizes the most important points.
- A concise summary and conclusion that provides a call to action.

--- WRITING STYLE ---
- Language: Use clear, professional language appropriate for the specified '{{tone}}' tone.
- Content: Focus on providing practical, actionable advice, real-world examples, and step-by-step instructions.
- Formatting: Ensure the entire output is a single, valid JSON object that strictly adheres to the output schema. The 'bookContent' field must be a well-formatted markdown string.

Begin generation now.
`,
});

async function trackTopicTrend(topic: string) {
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
          lastUpdated: serverTimestamp(),
        });
      } else {
        const newCount = (topicDoc.data().usage_count || 0) + 1;
        transaction.update(topicRef, {
          usage_count: newCount,
          lastUpdated: serverTimestamp(),
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
  const { output } = await contentGenerationPrompt(input);
  if (!output) {
    throw new Error('Failed to generate e-book content.');
  }
  
  // Track the trend in Firestore, but don't block the response
  trackTopicTrend(input.topic);

  return output;
}

ai.defineFlow(
  {
    name: 'generateEbookContentFlow',
    inputSchema: EbookGenerationConfigSchema,
    outputSchema: EbookContentSchema,
  },
  generateEbookContent
);
