import OpenAI from "openai";
import fs from "fs";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEbook(topic: string) {
  const chapters: (string | null)[] = [];

  for (let i = 1; i <= 12; i++) {
    console.log(`✍️ Writing chapter ${i}...`);
    const res = await client.chat.completions.create({
      model: "google/gemini-flash-1.5",
      messages: [
        {
          role: "user",
          content: `Write Chapter ${i} of a professional ebook about "${topic}". 
          Minimum 1200 words. No placeholders. Real content only.`,
        },
      ],
    });

    chapters.push(res.choices[0].message.content);
  }

  fs.writeFileSync("ebook.txt", chapters.join("\n\n"));
  return chapters;
}
