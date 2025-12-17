
import OpenAI from "openai";
import * as functions from "firebase-functions";

// TEMPORARY TEST: Log if the key exists
console.log("OPENROUTER KEY EXISTS:", !!functions.config().openrouter?.key);

const client = new OpenAI({
  apiKey: functions.config().openrouter.key,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEbook(topic: string) {
  const chapters = [];

  // Generate 5 chapters for the ebook
  for (let i = 1; i <= 5; i++) {
    console.time(`Chapter ${i}`);
    try {
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
        const content = res.choices[0].message.content;
        if (content) {
            chapters.push(content);
        }
    } catch(e: any) {
        console.error(`Error generating chapter ${i}:`, e.message);
        // Decide if you want to stop or continue on chapter error
        throw new functions.https.HttpsError('internal', `Failed to generate chapter ${i}.`);
    }
    console.timeEnd(`Chapter ${i}`);
  }

  const coverPrompt = `
    Professional ebook cover.
    Title centered.
    Typography clean.
    No random images.
    Theme matches: ${topic}
  `;

  let coverImageUrl = null;
  try {
      const imageResponse = await client.images.generate({
        model: "openai/dall-e-3",
        prompt: coverPrompt,
        n: 1,
        size: "1024x1792",
      });
      coverImageUrl = imageResponse.data[0]?.url;
  } catch(e: any) {
      console.error("Error generating cover image:", e.message);
      // Don't fail the whole process if only cover generation fails
  }
  
  return { chapters, coverImageUrl };
}
