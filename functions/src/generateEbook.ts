
import OpenAI from "openai";
import fs from "fs";
import * as functions from "firebase-functions";

// TEMPORARY TEST: Log if the key exists
console.log("OPENROUTER KEY EXISTS:", !!functions.config().openrouter?.key);

const client = new OpenAI({
  apiKey: functions.config().openrouter.key,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEbook(topic: string) {
  const chapters = [];

  // Reduced to 2 for faster testing
  for (let i = 1; i <= 2; i++) {
    console.time(`Chapter ${i}`);
    const res = await client.chat.completions.create({
      model: "google/gemini-flash-1.5",
      messages: [
        {
          role: "user",
          content: `Write Chapter ${i} of a professional ebook about "${topic}". 
          Minimum 400 words. No placeholders. Real content only.`,
        },
      ],
    });
    console.timeEnd(`Chapter ${i}`);

    const content = res.choices[0].message.content;
    if (content) {
      chapters.push(content);
    }
  }

  const coverPrompt = `
    Professional ebook cover.
    Title centered.
    Typography clean.
    No random images.
    Theme matches: ${topic}
  `;

  const imageResponse = await client.images.generate({
    model: "openai/dall-e-3",
    prompt: coverPrompt,
    n: 1,
    size: "1024x1792",
  });

  const coverImageUrl = imageResponse.data[0]?.url;
  
  return { chapters, coverImageUrl };
}
