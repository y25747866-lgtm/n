
import OpenAI from "openai";
import * as functions from "firebase-functions";

const client = new OpenAI({
  apiKey: functions.config().openrouter.key,
  baseURL: "https://openrouter.ai/api/v1",
});

function escape(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateFallbackCover(title: string, subtitle: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1792' viewBox='0 0 1024 1792'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#3B82F6'/>
        <stop offset='1' stop-color='#8B5CF6'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <g transform='translate(50 400)'>
      <text x='0' y='0' font-size='96' fill='#fff' font-weight='700' font-family='sans-serif' text-anchor='start'>
        ${escape(title)}
      </text>
      <text x='0' y='150' font-size='48' fill='rgba(255,255,255,0.8)' font-family='sans-serif' text-anchor='start'>
        ${escape(subtitle)}
      </text>
    </g>
    <text x='50' y='1742' font-size='24' fill='rgba(255,255,255,0.7)' font-family='sans-serif'>NexoraOS AI</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}


export async function generateEbook(topic: string) {
  const prompt = `
You are a professional ebook writer and content architect. Your task is to generate a complete, non-fiction ebook based on a given topic.

**Topic:** "${topic}"

**Output Requirements:**
Your final output MUST be a single, valid JSON object. Do not include any text, markdown, or comments before or after the JSON object. The JSON object must strictly adhere to the following schema:

\`\`\`json
{
  "title": "A compelling and relevant title for the ebook.",
  "subtitle": "A catchy and descriptive subtitle.",
  "chapters": [
    {
      "title": "Title of Chapter 1",
      "content": "Full, well-written text for the first chapter, approximately 700-900 words. Use paragraphs, bullet points, and clear explanations."
    },
    {
      "title": "Title of Chapter 2",
      "content": "Full, well-written text for the second chapter, following the same quality and length guidelines."
    }
  ],
  "conclusion": "A summary of the ebook's key takeaways and a strong concluding statement."
}
\`\`\`

**Instructions:**
1.  **Generate a Book Title and Subtitle:** Create a captivating title and subtitle that accurately reflect the ebook's content and the provided topic.
2.  **Outline and Write Chapters:** Develop a logical flow with 10-12 chapters. Write the full content for each chapter, ensuring each is between 700-900 words. Include practical examples, bullet points for key information, and clear, structured text.
3.  **Write a Conclusion:** Summarize the main points of the ebook and provide a concluding thought.
4.  **Format as JSON:** Ensure the entire output is a single, valid JSON object matching the schema above. All text content within the JSON, including chapter content, must be properly escaped (e.g., newlines as \\n, quotes as \\").
`;

  console.time("EbookContentGeneration");
  const contentResponse = await client.chat.completions.create({
    model: "google/gemini-flash-1.5",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });
  console.timeEnd("EbookContentGeneration");
  
  const ebookJsonString = contentResponse.choices[0].message.content;
  if (!ebookJsonString) {
      throw new Error("AI returned empty content.");
  }
  
  const ebookObject = JSON.parse(ebookJsonString);

  const coverPrompt = `
    Design a professional and visually appealing ebook cover.
    The cover should be clean, modern, and directly related to the theme.
    - Ebook Title: "${ebookObject.title}"
    - Ebook Topic: "${topic}"
    - Style: Minimalist, with a focus on clean typography and a strong central graphic or abstract element. Avoid stock photos of people. Use a professional color palette.
  `;

  let coverImageUrl = null;
  try {
      console.time("CoverImageGeneration");
      const imageResponse = await client.images.generate({
        model: "openai/dall-e-3",
        prompt: coverPrompt,
        n: 1,
        size: "1024x1792",
      });
      coverImageUrl = imageResponse.data[0]?.url;
      console.timeEnd("CoverImageGeneration");
  } catch(e: any) {
      console.error("Error generating cover image, using fallback:", e.message);
      // Don't fail the whole process if only cover generation fails
      coverImageUrl = generateFallbackCover(ebookObject.title, ebookObject.subtitle || "");
  }
  
  return { ...ebookObject, coverImageUrl };
}
