import { openrouter } from "@/ai/openrouter";

export async function POST(req: Request) {
  const { topic } = await req.json();

  const completion = await openrouter.chat.completions.create({
    model: "google/gemini-flash-1.5",
    messages: [
      {
        role: "system",
        content: `
You are an expert digital product creator.

Your task:
- Generate a high-quality non-fiction e-book
- Length: 8–10 chapters
- Clear, simple language
- Actionable steps
- NO AI mentions

Output JSON only in this format:
{
  "title": "",
  "subtitle": "",
  "chapters": [
    { "title": "", "content": "" }
  ],
  "conclusion": "",
  "cover_prompt": "short image prompt for a premium ebook cover"
}
        `,
      },
      {
        role: "user",
        content: `Create an ebook about: ${topic}`,
      },
    ],
   response_format: { type: "json_object" },
  });

  return Response.json({
    ebook: completion.choices[0].message.content,
  });
}
