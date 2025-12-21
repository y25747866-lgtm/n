
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
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional eBook writer, editor, and publisher. Your task is to automatically generate a COMPLETE professional eBook from ONLY a topic. Do NOT ask any questions. Do NOT require titles, subtitles, or outlines from the user. Do NOT return JSON. Do NOT return HTML. Do NOT use code blocks. The output must be clean plain text (Markdown is allowed). You must generate EVERYTHING by yourself in this exact order: 1. BOOK TITLE, 2. BOOK SUBTITLE, 3. BOOK DESCRIPTION, 4. TABLE OF CONTENTS (10–15 chapters), 5. FULL CHAPTER CONTENT (long, detailed, professional — enough for a 40–50 page PDF), 6. FINAL CONCLUSION, 7. PROFESSIONAL AI COVER IMAGE PROMPT (print-ready). Write full chapters, NOT placeholders. No mock text. No filler lines. No explanations. No errors. If something fails internally, retry silently and continue. Start immediately.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}`,
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
