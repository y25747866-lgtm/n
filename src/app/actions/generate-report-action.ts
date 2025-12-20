
"use server";

import { openrouter } from "@/lib/openrouter";

export async function generateReportAction(prompt: string) {
  try {

    const ebookPrompt = `
You are a professional e-book author, editor, and publishing system.

Your task is to generate a COMPLETE, REAL, PROFESSIONAL e-book — not a preview, not a summary, and not placeholder content.

IMPORTANT RULES (MUST FOLLOW ALL):

1. Automatically create:
   - A professional book title
   - A compelling subtitle
   - A short book description (3–4 lines)

2. The e-book MUST be long enough to produce 40–50 PDF pages.
   - Minimum total word count: 18,000–25,000 words
   - Minimum chapters: 10–12
   - Each chapter must be 1,500–2,200 words
   - Write in clear, high-quality professional English

3. Chapter rules:
   - Every chapter must have a meaningful title
   - NO placeholder text
   - NO “mock content”
   - NO repeated lines
   - NO summaries pretending to be chapters
   - Write FULL, DETAILED sections with examples, explanations, and actionable insights

4. Writing quality:
   - Structured headings
   - Short paragraphs
   - Bullet points where useful
   - Real explanations, not filler
   - Sound like a premium paid e-book

5. Formatting output EXACTLY like this:

---
BOOK_TITLE:
<Generated title>

BOOK_SUBTITLE:
<Generated subtitle>

BOOK_DESCRIPTION:
<3–4 line description>

---
TABLE_OF_CONTENTS:
1. Chapter title
2. Chapter title
...

---
CHAPTER_1_TITLE:
<Title>

CHAPTER_1_CONTENT:
<Full chapter content>

---
CHAPTER_2_TITLE:
<Title>

CHAPTER_2_CONTENT:
<Full chapter content>

(repeat for all chapters)

---
CONCLUSION:
<Full conclusion, not a summary>

---

6. DO NOT:
   - Explain what you are doing
   - Apologize
   - Shorten the book
   - Stop early
   - Say “this is a preview”
   - Mention AI, prompts, or generation

7. Assume this content will be:
   - Converted into a real PDF
   - Sold as a paid digital product
   - Used in a professional platform like synthesise.ai

TOPIC:
${prompt}
`;

    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "user", content: ebookPrompt }
      ],
    });

    return {
      content: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("AI ERROR:", error);
    throw new Error("Failed to communicate with the AI service");
  }
}
