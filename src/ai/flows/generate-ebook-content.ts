
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

const contentGenerationPrompt = ai.definePrompt({
  name: 'generateEbookPrompt',
  input: { schema: GenerationConfigSchema },
  output: { schema: EbookContentSchema },
  prompt: `
You are an expert author tasked with writing a comprehensive and practical e-book.

--- USER REQUIREMENTS ---
Topic: "{{topic}}"
Author: "{{authorName}}"
Product Type: "{{productType}}"
Tone: "{{tone}}"
Target Length: Approximately 40-50 pages.

--- E-BOOK STRUCTURE (JSON) ---
You must generate a complete JSON object adhering strictly to the output schema.
The e-book needs to be structured as follows:
1.  **title**: A compelling and marketable title for the e-book.
2.  **subtitle**: A brief, catchy subtitle that expands on the title.
3.  **author**: The author's name as provided.
4.  **table_of_contents**: An array of strings, where each string is a chapter title. Must contain 10-12 chapters.
5.  **chapters**: An array of chapter objects. Each chapter object must contain:
    - **chapter_title**: The title of the chapter.
    - **sections**: An array of 2-3 section objects. Each section object must contain:
      - **heading**: A clear heading for the section.
      - **content**: The detailed, well-written content for that section in markdown format.
6.  **estimated_pages**: An integer representing the estimated page count (between 40 and 50).

--- WRITING STYLE & RULES ---
- **Tone**: The writing must be practical and actionable. Avoid fluff, filler content, and AI disclaimers (e.g., "As an AI...").
- **Content**: Provide in-depth, valuable information. Use real-world examples, step-by-step instructions, and logical structuring.
- **Uniqueness**: Ensure the content is unique and original.
- **Formatting**: All content within the 'sections' must be valid markdown.

Begin generation now.
`,
  config: {
    temperature: 0.8,
  }
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
    inputSchema: GenerationConfigSchema,
    outputSchema: EbookContentSchema,
  },
  generateEbookContent
);
