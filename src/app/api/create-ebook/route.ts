import { generateLongEbookPDF } from "@/lib/pdf-generator";
import { z } from 'zod';

const EbookRequestSchema = z.object({
  topic: z.string(),
  category: z.string(),
});

const EbookContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  chapters: z.array(z.object({
    title: z.string(),
    content: z.string(),
  })),
  conclusion: z.string(),
  cover_image_prompt: z.string(),
});


export async function POST(req: Request) {
  const body = await req.json();
  const validation = EbookRequestSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { topic, category } = validation.data;

  const systemPrompt = `
You are a professional author and book designer.
Your task is to generate a complete non-fiction e-book based on a topic and category.

Topic: ${topic}
Category: ${category}

RULES:
- The book should have 5 chapters.
- Each chapter must be between 400-600 words.
- The content must be practical, well-structured, and professional.
- Generate a compelling title and a short, catchy subtitle.
- Generate a detailed, creative prompt for a premium, modern e-book cover image. The prompt should reflect the topic and category.
- The conclusion should summarize the key takeaways and provide a call to action.

JSON OUTPUT FORMAT (MUST MATCH EXACTLY):
{
  "title": "The main title of the e-book",
  "subtitle": "A brief, catchy subtitle",
  "chapters": [
    { "title": "Chapter 1 Title", "content": "Full text for chapter 1..." },
    { "title": "Chapter 2 Title", "content": "Full text for chapter 2..." }
  ],
  "conclusion": "Final summary and action steps...",
  "cover_image_prompt": "A short image prompt for a premium ebook cover..."
}
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nousresearch/hermes-2-pro-llama-3-8b",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create the e-book now.` }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error Response: ${errorBody}`);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const completion = await response.json();

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("Invalid response structure from API");
    }

    const ebookData = EbookContentSchema.parse(JSON.parse(completion.choices[0].message.content));

    return new Response(JSON.stringify(ebookData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error("Error calling OpenRouter API:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
