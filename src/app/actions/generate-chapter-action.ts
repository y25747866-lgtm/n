
'use server';

import { openrouter } from "@/lib/openrouter";

export async function generateChapter(topic: string, chapterTitle: string) {
  try {
    const response = await openrouter.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: `Write a detailed chapter for an e-book.
Topic: ${topic}
Chapter Title: ${chapterTitle}
Include professional formatting, clear paragraphs, and enough content to fill 3-5 pages in a PDF.`
        }
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("Chapter generation failed:", err);
    throw new Error("AI Generation Failed");
  }
}
