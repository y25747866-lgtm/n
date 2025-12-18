
import OpenAI from 'openai';
import { EbookContentSchema, type EbookContent } from './types';

// This file uses the OpenRouter API. You can replace it with any OpenAI-compatible API.
// It is configured to use the Google Gemini Flash model, which is a fast and affordable model
// suitable for this kind of content generation.

const aiClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY, // Ensure you have this in your .env file
});

const generationSystemPrompt = `You are an expert author and content creator specializing in writing concise, high-quality e-books and reports. Your tone is authoritative yet accessible.

When given a topic, you will generate a complete e-book with the following structure:
1.  A compelling and marketable **title**.
2.  A concise and engaging **subtitle**.
3.  A series of **chapters**, where each chapter has a title and content in markdown format. Aim for 3-5 chapters unless the topic demands more.
4.  A **conclusion** that summarizes the key takeaways.

You MUST respond with a valid JSON object that strictly adheres to the following JSON Schema:
${JSON.stringify(EbookContentSchema.jsonSchema, null, 2)}

Do not include any introductory text or apologies in your response. Only output the JSON object.`;


export async function generateEbook({ topic }: { topic: string }): Promise<EbookContent> {
  try {
    const response = await aiClient.chat.completions.create({
      model: 'google/gemini-flash-1.5', // A fast and capable model for this task
      messages: [
        { role: 'system', content: generationSystemPrompt },
        { role: 'user', content: `Generate an e-book about: "${topic}"` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned an empty response.');
    }

    const parsedContent = JSON.parse(content);
    
    // Validate the response against our schema to ensure correctness
    const validation = EbookContentSchema.safeParse(parsedContent);
    if (!validation.success) {
        console.error("AI Response Validation Error:", validation.error.flatten());
        throw new Error('AI returned data in an invalid format.');
    }

    return validation.data;

  } catch (error) {
    console.error('Error generating e-book with AI:', error);
    // Re-throw a more user-friendly error
    throw new Error('Failed to communicate with the AI service.');
  }
}
