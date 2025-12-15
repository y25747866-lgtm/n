
'use server';
/**
 * @fileoverview This file initializes the Genkit AI singleton with the Google AI plugin.
 *
 * It configures Genkit to use Google's generative AI models by default for all AI operations.
 * It also exports the initialized `ai` object for use in other parts of the application,
 * such as in defining AI flows and prompts.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
// This makes Google's models available for use in flows.
// The plugin is configured using environment variables (e.g., GEMINI_API_KEY).
export const ai = genkit({
  plugins: [googleAI()],
});
