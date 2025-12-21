
'use server';

import { openrouter } from "@/lib/openrouter";

export async function generateChapterAction(topic: string, chapterTitle: string) {
  try {
    const response = await openrouter.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class e-book writer. Your writing is clear, engaging, and detailed. Write the chapter content as if it's for a published book. Do not include the chapter title in your response, only the body content. Use markdown for formatting."
        },
        {
          role: "user",
          content: `Write a full, detailed chapter for an e-book on the topic "${topic}".

Chapter Title: "${chapterTitle}"

Write a comprehensive chapter of at least 1500-2000 words. Provide in-depth explanations, practical examples, and actionable advice. The tone should be professional and authoritative.`
        }
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
        return { ok: false, error: "AI returned empty content for the chapter." };
    }

    return {
      ok: true,
      content,
    };
  } catch (err: any) {
    console.error("Chapter generation failed:", err);
    return {
      ok: false,
      error: err.message || "An unknown error occurred during chapter generation."
    };
  }
}
