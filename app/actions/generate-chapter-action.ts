
'use server';

import { openrouter } from "@/lib/openrouter";

export async function generateChapterAction(topic: string, chapterTitle: string) {
  try {
    const response = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You are a world-class e-book writer. Your writing is clear, engaging, and detailed. Write the chapter content as if it's for a published book. Do not include the chapter title in your response, only the body content. Use markdown for formatting. Respond with only the chapter content."
        },
        {
          role: "user",
          content: `Write a full, detailed chapter for an e-book on the topic "${topic}".

The title of this chapter is: "${chapterTitle}"

Write a comprehensive chapter of at least 800-1000 words. Provide in-depth explanations, practical examples, and actionable advice. The tone should be professional and authoritative. Do not write the chapter title, just the content.`
        }
      ],
      max_tokens: 1200, // Keep token usage per chapter low to avoid credit issues
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { ok: false, error: "AI returned empty content for the chapter." };
    }

    return { ok: true, content };

  } catch (err: any) {
    console.error("Chapter generation failed:", err);
    return { 
        ok: false, 
        error: err.message || "An unknown error occurred during chapter generation." 
    };
  }
}

    