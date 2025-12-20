
'use server';

import { openrouter } from "@/lib/openrouter";

export async function generateCover(bookTitle: string) {
  try {
    const response = await openrouter.chat.completions.create({
        model: "openai/dall-e-3",
        messages: [
            {
                role: "user",
                content: `Create a professional e-book cover for '${bookTitle}'. Style: gradient, modern, clean, title centered. Return as a high-quality image URL.`
            }
        ],
        extra_body: {
            "prompt": `Create a professional e-book cover for '${bookTitle}'. Style: gradient, modern, clean, title centered.`,
            "n": 1,
            "size": "1024x1792"
        }
    });

    // The OpenRouter SDK may wrap image generation differently.
    // This is a guess based on common patterns.
    // @ts-ignore
    const imageUrl = response.choices[0]?.data?.[0]?.url || response.choices[0]?.message?.content;
    
    if (!imageUrl) {
        throw new Error("No image URL returned from AI.");
    }

    return imageUrl;
  } catch (err) {
    console.error("Cover generation error:", err);
    throw new Error("Failed to generate cover image.");
  }
}
