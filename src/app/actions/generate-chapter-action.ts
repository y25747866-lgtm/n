
"use server";

import { openrouter } from "@/lib/openrouter";

export async function generateChapterAction(bookTitle: string, chapterTitle: string) {
  try {
    const chapterPrompt = `
You are a professional e-book author and editor. Your task is to write a single, complete, and high-quality chapter for an e-book.

BOOK TITLE: "${bookTitle}"
CHAPTER TITLE: "${chapterTitle}"

REQUIREMENTS:
- Word Count: Write a detailed chapter of 1,800–2,200 words.
- Content Quality: Provide detailed explanations, actionable insights, and concrete examples. The content must be practical, informative, and engaging.
- Professional Tone: Write in clear, professional English suitable for a premium, paid e-book.
- Structure: Use markdown for formatting. Use headings, subheadings, bullet points, and short paragraphs to improve readability.
- No Placeholders: Do not use any placeholder text, summaries, or repeated lines. Write the full chapter content from start to finish.
- No Introductions/Outros: Do not add any introductory text like "Here is the chapter..." or concluding remarks. Output ONLY the chapter content itself.

The chapter should start directly with its content.
`;

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "user", content: chapterPrompt }
      ],
    });

    return {
      content: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("AI CHAPTER ERROR:", error);
    throw new Error("Failed to communicate with the AI service for chapter generation.");
  }
}
