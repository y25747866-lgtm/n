
import { z } from 'zod';

const TemplateRequestSchema = z.object({
  topic: z.string(),
  templateType: z.string(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validation = TemplateRequestSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { topic, templateType } = validation.data;

  const systemPrompt = `
You are an expert content creator specializing in digital templates.
Your task is to generate a high-quality, practical, and ready-to-use template based on a user's request.

Template Type: ${templateType}
Topic: ${topic}

RULES:
- Generate the content as plain text. Use markdown for structure (headings, lists, etc.).
- The content should be comprehensive and genuinely useful.
- Do NOT include any placeholder text like "[Your Content Here]".
- Do NOT add any explanations, preamble, or post-amble. Just the template content.
- Give it a simple, clear title.

JSON OUTPUT FORMAT (MUST MATCH EXACTLY):
{
  "title": "The main title for the template",
  "content": "The full text content of the template, using markdown for formatting."
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
          { role: "user", content: `Create the template now.` }
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

    const templateData = JSON.parse(completion.choices[0].message.content);

    return new Response(JSON.stringify(templateData), {
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
