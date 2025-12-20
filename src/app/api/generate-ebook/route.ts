import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // must be set in .env
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ success: false, error: "Topic missing" }, { status: 400 });
    }

    // Call OpenRouter AI
    const aiResponse = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write a full e-book on the topic: "${topic}". It must be long enough to produce 40-50 PDF pages (18,000-25,000 words total). Structure it with a book title, subtitle, description, a table of contents with 10-12 chapters, full content for each chapter (1500-2200 words each), and a final conclusion. Format the entire output as a single block of structured text following these rules: BOOK_TITLE: ..., BOOK_SUBTITLE: ..., etc. Also include a professional prompt that can be used to generate a cover image for this book.`,
        },
      ],
    });

    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Here you can generate PDF from 'content' using any PDF library
    // For now, let's just return the text
    return NextResponse.json({
      success: true,
      content,
      message: `Ebook for "${topic}" generated successfully`,
    });
  } catch (err: any) {
    console.error("AI generation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
