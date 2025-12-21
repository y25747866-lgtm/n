
import OpenAI from "openai";

// Note: Server actions run on the server, so the API key is safe here.
// Do not prefix with NEXT_PUBLIC_ if this is only used server-side.
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});


