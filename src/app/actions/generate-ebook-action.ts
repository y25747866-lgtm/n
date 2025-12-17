
'use server';

import { EbookContent, EbookContentSchema } from '@/lib/types';
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function generateOutline(topic: string) {
    const response = await client.chat.completions.create({
        model: "google/gemini-flash-1.5",
        messages: [{
            role: "user",
            content: `Create an ebook outline for the topic: "${topic}".
            
            Provide the following:
            - A main title (string)
            - A subtitle (string)
            - A list of 10 chapter titles (array of strings)
            - A conclusion title (string, e.g. "Conclusion")

            Return ONLY a JSON object in the following format: 
            { "title": "...", "subtitle": "...", "chapters": ["..."], "conclusion": "..." }`
        }],
        response_format: { type: "json_object" }
    });
    const outlineJson = response.choices[0].message.content;
    if (!outlineJson) throw new Error("Failed to generate outline.");
    
    // Basic parsing and validation
    try {
      const parsed = JSON.parse(outlineJson);
      if (!parsed.title || !parsed.chapters || parsed.chapters.length === 0) {
        throw new Error("Invalid outline structure received from AI.");
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse outline JSON:", e);
      throw new Error("Failed to parse ebook outline from AI response.");
    }
}

async function generateChapter(topic: string, chapterTitle: string): Promise<string> {
    console.time(`chapter: ${chapterTitle}`);
    const response = await client.chat.completions.create({
        model: "google/gemini-flash-1.5",
        messages: [{
            role: "user",
            content: `Write a chapter for a professional ebook on the topic "${topic}".
            The chapter title is "${chapterTitle}".
            
            - Write at least 800 words.
            - Provide real, high-quality content. Do not use placeholders.
            - Format the content using markdown (e.g., #, ##, *, -).`
        }]
    });
    console.timeEnd(`chapter: ${chapterTitle}`);
    const content = response.choices[0].message.content;
    if (!content) throw new Error(`Failed to generate content for chapter: ${chapterTitle}`);
    return content;
}

async function generateCover(topic: string, title: string): Promise<string> {
    const coverPrompt = `
    Professional ebook cover for a book about "${topic}".
    The title "${title}" should be centered and clearly visible.
    The typography should be clean, modern, and professional.
    Do not include any random or unrelated images. The design should be abstract or thematic, matching the topic.
    High resolution, print quality.
  `;

  const imageResponse = await client.images.generate({
    model: "openai/dall-e-3",
    prompt: coverPrompt,
    n: 1,
    size: "1024x1792",
  });
  
  const coverImageUrl = imageResponse.data[0]?.url;
  if (!coverImageUrl) throw new Error("Failed to generate cover image.");
  return coverImageUrl;
}


export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  
  console.log("🔥 EBOOK GENERATION STARTED for topic:", topic);

  try {
    // 1. Generate Outline
    const outline = await generateOutline(topic);

    // 2. Generate Chapters in parallel
    const chapterPromises = outline.chapters.map((chapterTitle: string) => 
        generateChapter(topic, chapterTitle).then(content => ({ title: chapterTitle, content }))
    );
    const chapters = await Promise.all(chapterPromises);
    
    // 3. Generate Conclusion
    const conclusionContent = await generateChapter(topic, outline.conclusion);

    // 4. Generate Cover Image
    const coverImageUrl = await generateCover(topic, outline.title);

    const ebook: EbookContent = {
        title: outline.title,
        subtitle: outline.subtitle,
        chapters: chapters,
        conclusion: conclusionContent,
        coverImageUrl: coverImageUrl,
    };
    
    // Final validation with Zod
    const validatedEbook = EbookContentSchema.parse(ebook);

    console.log("✅ EBOOK GENERATION COMPLETE");
    return { success: true, ebook: validatedEbook };

  } catch (error: any) {
    console.error("Ebook generation failed:", error);
    return { success: false, error: "AI GENERATION FAILED — " + error.message };
  }
}
