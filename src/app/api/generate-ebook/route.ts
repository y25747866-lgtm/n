
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generateEbookPDF } from "@/lib/generatePDF";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // must be set in .env
  baseURL: "https://openrouter.ai/api/v1",
});


// Helper function to parse the AI-generated text
function parseEbookContent(rawContent: string) {
    const lines = rawContent.split('\n');
    let title = 'Untitled E-book';
    let subtitle = '';
    let description = '';
    let coverPrompt = '';
    const chapters: { title: string; content: string }[] = [];
    let currentChapterTitle: string | null = null;
    let currentChapterContent = '';
    let parsingStage: 'title' | 'subtitle' | 'description' | 'toc' | 'chapters' | 'conclusion' | 'cover' | null = null;

    for (const line of lines) {
        if (line.startsWith('BOOK TITLE:')) {
            title = line.replace('BOOK TITLE:', '').trim();
            parsingStage = 'subtitle';
            continue;
        }
        if (line.startsWith('BOOK SUBTITLE:')) {
            subtitle = line.replace('BOOK SUBTITLE:', '').trim();
            parsingStage = 'description';
            continue;
        }
        if (line.startsWith('BOOK DESCRIPTION:')) {
            description = line.replace('BOOK DESCRIPTION:', '').trim();
            parsingStage = 'toc';
            continue;
        }
        if (line.startsWith('TABLE OF CONTENTS')) {
            parsingStage = 'chapters';
            continue;
        }
        if (line.startsWith('CHAPTER') && parsingStage === 'chapters') {
            if (currentChapterTitle) {
                chapters.push({ title: currentChapterTitle, content: currentChapterContent.trim() });
            }
            const match = line.match(/CHAPTER\s*\d+:\s*(.*)/);
            currentChapterTitle = match ? match[1].trim() : line.trim();
            currentChapterContent = '';
            continue;
        }
        if (line.startsWith('FINAL CONCLUSION')) {
             if (currentChapterTitle) { // Save the last chapter
                chapters.push({ title: currentChapterTitle, content: currentChapterContent.trim() });
            }
            currentChapterTitle = "FINAL CONCLUSION";
            currentChapterContent = "";
            parsingStage = 'conclusion';
            continue;
        }
        if(line.startsWith("PROFESSIONAL AI COVER IMAGE PROMPT")){
            if (currentChapterTitle) { // Save conclusion
                chapters.push({ title: currentChapterTitle, content: currentChapterContent.trim() });
            }
            parsingStage = 'cover';
            coverPrompt = line.replace('PROFESSIONAL AI COVER IMAGE PROMPT:', "").trim();
            continue;
        }

        if (parsingStage === 'chapters' || parsingStage === 'conclusion') {
             if(line.match(/^\d+\.\s.*/)){ // skip numbered lists in TOC
                continue;
            }
            currentChapterContent += line + '\n';
        } else if (parsingStage === 'cover'){
            coverPrompt += ' ' + line.trim();
        } else if (parsingStage === 'description') {
            description += ' ' + line.trim();
        }
    }
    
    // push the last bits
    if (parsingStage === 'cover' && !chapters.find(c => c.title === "FINAL CONCLUSION")) {
        chapters.push({ title: "FINAL CONCLUSION", content: currentChapterContent.trim() });
    }

    return { title, subtitle, description, chapters, coverPrompt };
}


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
          role: "user",
          content: `You are a professional eBook writer, editor, and publisher.

Your task:
- Automatically generate a COMPLETE professional eBook from ONLY a topic.
- Do NOT ask any questions.
- Do NOT require titles, subtitles, or outlines from the user.
- Do NOT return JSON.
- Do NOT return HTML.
- Do NOT use code blocks.
- Output must be clean plain text (Markdown allowed).

You must generate EVERYTHING by yourself in this exact order:

1. BOOK TITLE: [Your Title Here]
2. BOOK SUBTITLE: [Your Subtitle Here]
3. BOOK DESCRIPTION: [3-4 line description]
4. TABLE OF CONTENTS (10–15 chapters)
5. FULL CHAPTER CONTENT (long, detailed, professional — enough for a 40–50 page PDF)
6. FINAL CONCLUSION
7. PROFESSIONAL AI COVER IMAGE PROMPT (print-ready): [Your Prompt Here]

Rules:
- Write full chapters, NOT placeholders.
- No mock text.
- No filler lines.
- No explanations.
- No errors.
- If something fails internally, retry silently and continue.

Start immediately.

Topic: ${topic}`,
        },
      ],
    });

    const rawContent = aiResponse.choices?.[0]?.message?.content || "";
    if (!rawContent) {
        throw new Error("AI failed to generate any content.");
    }

    const { title, subtitle, chapters, coverPrompt } = parseEbookContent(rawContent);

    // Ensure the output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'generated-books');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Sanitize title for filename
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const outputFilePath = path.join(outputDir, `${sanitizedTitle}_${Date.now()}.pdf`);
    
    // For now, let's use a placeholder for the cover image
    const coverUrl = `https://picsum.photos/seed/${encodeURIComponent(title)}/800/1200`;

    await generateEbookPDF({
        coverUrl,
        title,
        subtitle,
        chapters,
        outputFilePath
    });
    
    // Return the public path
    const publicPath = `/generated-books/${path.basename(outputFilePath)}`;
    
    return NextResponse.json({
      success: true,
      pdfPath: publicPath,
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
