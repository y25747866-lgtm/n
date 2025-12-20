
"use server";

import { openrouter } from "@/lib/openrouter";

export async function generateReportAction(prompt: string) {
  try {

    const ebookPrompt = `
You are a professional e-book author and editor. Your task is to generate a compelling outline for an e-book based on a given topic.

You must generate:
1.  A professional and engaging book title.
2.  A concise and catchy subtitle.
3.  A short book description (3-4 lines).
4.  A table of contents with 10-12 meaningful chapter titles.

FORMATTING RULES:
- Output ONLY the structured text as specified below.
- Do NOT add any explanations, apologies, or introductory text.

---
BOOK_TITLE:
<Generated title>

BOOK_SUBTITLE:
<Generated subtitle>

BOOK_DESCRIPTION:
<Generated description>

---
TABLE_OF_CONTENTS:
1. <Chapter 1 Title>
2. <Chapter 2 Title>
3. <Chapter 3 Title>
4. <Chapter 4 Title>
5. <Chapter 5 Title>
6. <Chapter 6 Title>
7. <Chapter 7 Title>
8. <Chapter 8 Title>
9. <Chapter 9 Title>
10. <Chapter 10 Title>
---

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
    throw new Error("Failed to communicate with the AI service. Please check your API key and try again.");
  }
}
