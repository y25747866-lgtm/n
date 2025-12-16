/**
 * @fileoverview This file initializes the Genkit AI framework with necessary plugins.
 * It exports a single `ai` object that is used throughout the application to
 * define and run AI-powered flows and prompts.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
// This makes Google's models available for use in flows.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Log all traces to the console for debugging.
  logLevel: 'debug',
  // In a real-world app, you would configure a trace store here.
  // traceStore: 'firebase',
});
