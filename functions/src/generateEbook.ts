
import OpenAI from "openai";
import * as functions from "firebase-functions";

// TEMPORARY TEST: Log if the key exists
console.log("OPENROUTER KEY EXISTS:", !!functions.config().openrouter?.key);

const client = new OpenAI({
  apiKey: functions.config().openrouter.key,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEbook(topic: string) {
  const prompt = `
You are a professional ebook writer.

Generate a FULL non-fiction ebook:
- Topic: ${topic}
- Pages: 20–30
- Chapters: 10–12
- Each chapter: 700–900 words
- Include examples, bullet points, summaries
- Generate a book title automatically
- Generate a subtitle automatically
- Output clean structured text (no placeholders, no mock text)
`;

  console.time("EbookContentGeneration");
  const contentResponse = await client.chat.completions.create({
    model: "google/gemini-flash-1.5",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  console.timeEnd("EbookContentGeneration");
  
  const ebookText = contentResponse.choices[0].message.content;

  const coverPrompt = `
    Professional ebook cover.
    Title centered.
    Typography clean.
    No random images.
    Theme matches: ${topic}
  `;

  let coverImageUrl = null;
  try {
      console.time("CoverImageGeneration");
      const imageResponse = await client.images.generate({
        model: "openai/dall-e-3",
        prompt: coverPrompt,
        n: 1,
        size: "1024x1792",
      });
      coverImageUrl = imageResponse.data[0]?.url;
      console.timeEnd("CoverImageGeneration");
  } catch(e: any) {
      console.error("Error generating cover image:", e.message);
      // Don't fail the whole process if only cover generation fails
  }
  
  return { ebookText, coverImageUrl };
}
