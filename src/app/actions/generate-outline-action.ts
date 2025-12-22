
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
      model: "openai/gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert book editor and publisher. Your task is to create a compelling and logical book outline from a single topic. The outline must be in JSON format. The JSON object should have three keys: "title" (a catchy, professional book title), "subtitle" (a concise, descriptive subtitle), and "chapters" (an array of 10-15 descriptive chapter titles).`
        },
        {
          role: "user",
          content: `Generate a book outline for the topic: "${topic}"`
        }
      ],
    });

    const rawJson = response.choices[0].message.content;
    if (!rawJson) {
        return { ok: false, error: "AI returned an empty outline." };
    }

    const parsed = OutlineResponseSchema.safeParse(JSON.parse(rawJson));
    if (!parsed.success) {
        console.error("Invalid outline JSON:", parsed.error);
        return { ok: false, error: "AI returned an invalid outline structure." };
    }
    
    return {
      ok: true,
      outline: parsed.data as EbookOutline,
    };

  } catch (err: any) {
    console.error("Outline generation failed:", err);
    return {
      ok: false,
      error: err.message || "An unknown error occurred during outline generation."
    };
  }
}

    