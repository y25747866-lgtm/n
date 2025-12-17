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
  
  console.log("🎨 Designing cover...");

  const coverPrompt = `
    Professional ebook cover for a book about "${topic}".
    The title "${topic}" should be centered and clearly visible.
    The typography should be clean, modern, and professional.
    Do not include any random or unrelated images. The design should be abstract or thematic, matching the topic.
    High resolution, print quality.
  `;

  const imageResponse = await client.images.generate({
    model: "openai/dall-e-3",
    prompt: coverPrompt,
    n: 1,
    size: "1024x1792",
  });
  
  const coverImageUrl = imageResponse.data[0]?.url;
  console.log("✅ Cover generated:", coverImageUrl);

  return { chapters, coverImageUrl };
}
