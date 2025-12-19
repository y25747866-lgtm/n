"use server";

import { openrouter } from "@/lib/openrouter";

export async function generateReportAction(input: { topic: string }) {
  try {
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-flash-1.5:free",
      messages: [
        {
          role: "user",
          content: `Write a detailed 800-word article about: ${input.topic}`,
        },
      ],
    });

    return {
      content: completion.choices[0].message.content,
    };
  } catch (err) {
    console.error("AI ERROR:", err);
    throw new Error("Failed to communicate with the AI service");
  }
}
