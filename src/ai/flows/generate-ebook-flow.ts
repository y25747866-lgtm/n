
'use server';
/**
 * @fileOverview An AI flow for generating a complete ebook from a topic.
 *
 * - generateEbookFlow - A function that handles the ebook generation process.
 * - EbookGenerationInput - The input type for the ebook generation.
 * - EbookContent - The return type for the ebook generation, defined in @/lib/types.
 */

import { ai } from '@/ai/genkit';
import { EbookContentSchema, EbookContent } from '@/lib/types';
import { z } from 'zod';

const EbookGenerationInputSchema = z.string();
export type EbookGenerationInput = z.infer<typeof EbookGenerationInputSchema>;


function escape(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateFallbackCover(title: string, subtitle: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1792' viewBox='0 0 1024 1792'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#3B82F6'/>
        <stop offset='1' stop-color='#8B5CF6'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <g transform='translate(50 400)'>
      <text x='0' y='0' font-size='96' fill='#fff' font-weight='700' font-family='sans-serif' text-anchor='start'>
        ${escape(title)}
      </text>
      <text x='0' y='150' font-size='48' fill='rgba(255,255,255,0.8)' font-family='sans-serif' text-anchor='start'>
        ${escape(subtitle)}
      </text>
    </g>
    <text x='50' y='1742' font-size='24' fill='rgba(255,255,255,0.7)' font-family='sans-serif'>NexoraOS AI</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const contentGenerationPrompt = ai.definePrompt({
  name: 'generateEbookContentPrompt',
  input: { schema: EbookGenerationInputSchema },
  output: { schema: EbookContentSchema },
  prompt: `
You are a professional ebook writer and content architect. Your task is to generate a complete, non-fiction ebook based on a given topic.

**Topic:** "{{{prompt}}}"

**Output Requirements:**
Your final output MUST be a single, valid JSON object. Do not include any text, markdown, or comments before or after the JSON object. The JSON object must strictly adhere to the following schema, including all specified fields.

\`\`\`json
{
  "title": "A compelling and relevant title for the ebook.",
  "subtitle": "A catchy and descriptive subtitle.",
  "chapters": [
    {
      "title": "Title of Chapter 1",
      "content": "Full, well-written text for the first chapter, approximately 700-900 words. Use paragraphs, bullet points, and clear explanations."
    },
    {
      "title": "Title of Chapter 2",
      "content": "Full, well-written text for the second chapter, following the same quality and length guidelines."
    }
  ],
  "conclusion": "A summary of the ebook's key takeaways and a strong concluding statement."
}
\`\`\`

**Instructions:**
1.  **Generate a Book Title and Subtitle:** Create a captivating title and subtitle that accurately reflect the ebook's content and the provided topic.
2.  **Outline and Write Chapters:** Develop a logical flow with 2-3 chapters. Write the full content for each chapter, ensuring each is between 700-900 words. Include practical examples, bullet points for key information, and clear, structured text.
3.  **Write a Conclusion:** Summarize the main points of the ebook and provide a concluding thought.
4.  **Format as JSON:** Ensure the entire output is a single, valid JSON object matching the schema above. All text content within the JSON, including chapter content, must be properly escaped (e.g., newlines as \\n, quotes as \\").
`,
  config: {
      model: 'googleai/gemini-1.5-flash',
  }
});


const coverGenerationPrompt = ai.definePrompt({
    name: 'generateEbookCoverPrompt',
    input: { schema: z.object({ title: z.string(), topic: z.string() }) },
    prompt: `
        Design a professional and visually appealing ebook cover.
        The cover should be clean, modern, and directly related to the theme.
        - Ebook Title: "{{{title}}}"
        - Ebook Topic: "{{{topic}}}"
        - Style: Minimalist, with a focus on clean typography and a strong central graphic or abstract element. Avoid stock photos of people. Use a professional color palette.
    `,
    config: {
        model: 'googleai/imagen-4.0-fast-generate-001'
    }
});


export const generateEbookFlow = ai.defineFlow(
  {
    name: 'generateEbookFlow',
    inputSchema: EbookGenerationInputSchema,
    outputSchema: EbookContentSchema,
  },
  async (topic) => {
    
    console.log("Starting content generation...");
    const contentResponse = await contentGenerationPrompt(topic);
    const ebookObject = contentResponse.output;

    if (!ebookObject) {
      throw new Error("AI returned empty content.");
    }
    console.log("Content generation finished.");

    let coverImageUrl: string | undefined;
    try {
        console.log("Starting cover generation...");
        const imageResponse = await coverGenerationPrompt({ title: ebookObject.title, topic });
        coverImageUrl = imageResponse.media?.url;
        console.log("Cover generation finished.");
    } catch (e: any) {
        console.error("Error generating cover image, using fallback:", e.message);
        coverImageUrl = generateFallbackCover(ebookObject.title, ebookObject.subtitle || "");
    }
    
    return { ...ebookObject, coverImageUrl: coverImageUrl || generateFallbackCover(ebookObject.title, ebookObject.subtitle || "") };
  }
);
