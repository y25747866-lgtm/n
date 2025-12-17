
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

  for (let i = 1; i <= 12; i++) {
    console.time(`Chapter ${i}`);
    const res = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: `Write Chapter ${i} of a professional ebook about "${topic}". 
          Minimum 1200 words. No placeholders. Real content only.`,
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

  // In a real scenario, you'd save this to a file or return it.
  // fs.writeFileSync("ebook.txt", chapters.join("\n\n"));
  
  return { chapters, coverImageUrl };
}
