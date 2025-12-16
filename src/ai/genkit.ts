
'use server';

/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It exports a single `ai` object that is used throughout the application to
 * interact with generative models and define AI flows.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
// This makes Google's models available for use in flows.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
