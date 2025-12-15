
export async function POST(req: Request) {
  const { topic } = await req.json();

  const systemPrompt = `
You are a professional digital product creator and book author.

You MUST do ALL of the following automatically:
- Decide the best ebook TITLE by yourself
- Decide the best SUBTITLE by yourself
- Write a complete non-fiction ebook
- PDF 30-40 page 
- Each chapter must have real, useful, actionable content
- Clear language, beginner-friendly
- No filler text
- No placeholder text
- No mention of AI
- Professional tone

You must ALSO generate:
- A short but detailed PROMPT for an AI image generator
- The image prompt must describe a premium ebook cover
- Modern, clean, professional design
- Suitable for selling online

VERY IMPORTANT:
- Output ONLY valid JSON
- Do NOT add explanations
- Do NOT add extra text
- Do NOT wrap in markdown
- Do NOT add comments

JSON FORMAT (MUST MATCH EXACTLY):

{
  "title": "",
  "subtitle": "",
  "chapters": [
    {
      "title": "",
      "content": ""
    }
  ],
  "conclusion": "",
  "cover_image_prompt": ""
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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a complete ebook about this topic: ${topic}` }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const completion = await response.json();

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("Invalid response structure from API");
    }

    return Response.json({
      ebook: completion.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("Error calling OpenRouter API:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
