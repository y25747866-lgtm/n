
"use server";

import { openrouter } from "@/lib/openrouter";

export async function generateChapter(bookTitle: string, chapterTitle: string) {
  try {
    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Book title: ${bookTitle}\nChapter title: ${chapterTitle}\nRequirements: 1800-2200 words, detailed examples, actionable steps, professional style. Return in plain text.`
        }
      ],
    });

    return completion.choices[0]?.message?.content || "Chapter generation failed.";
  } catch (err) {
    console.error("Chapter generation error:", err);
    throw new Error("Failed to generate chapter.");
  }
}
