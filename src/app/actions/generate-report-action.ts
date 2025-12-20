"use server";

import { openrouter } from "@/lib/openrouter";

export async function generateReportAction(prompt: string) {
  try {
    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    return {
      content: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("AI ERROR:", error);
    throw new Error("Failed to communicate with the AI service");
  }
}
