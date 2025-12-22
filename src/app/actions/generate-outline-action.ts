
'use server';

import { openrouter } from "@/lib/openrouter";
import { EbookOutline } from "@/lib/types";
import { z } from "zod";

const OutlineResponseSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    chapters: z.array(z.string()),
});

export async function generateOutlineAction(topic: string) {
  try {
    const response = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert book editor. Create an outline for a book about the provided topic. Output strictly in JSON format: { "title": "...", "subtitle": "...", "chapters": ["Chapter 1", "Chapter 2", "..."] }. The 'chapters' array should contain 10-12 descriptive chapter titles.`
        },
        {
          role: "user",
          content: `Topic: "${topic}"`
        }
      ],
      max_tokens: 1000,
    });

    const rawJson = response.choices[0].message.content;
    if (!rawJson) {
        return { ok: false, error: "AI returned an empty outline." };
    }

    // Wrap parsing and validation in a try/catch block for resilience
    try {
        const parsed = OutlineResponseSchema.parse(JSON.parse(rawJson));
        return {
          ok: true,
          outline: parsed as EbookOutline,
        };
    } catch (parsingError) {
        console.error("AI returned invalid JSON for outline:", rawJson, parsingError);
        return { ok: false, error: "AI returned an invalid outline structure." };
    }

  } catch (err: any) {
    console.error("Outline generation failed:", err);
    return {
      ok: false,
      error: err.message || "An unknown error occurred during outline generation."
    };
  }
}
