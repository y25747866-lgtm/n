
'use server';
/**
 * @fileOverview Initializes and configures the Genkit AI platform.
 *
 * This file sets up the Genkit framework with the necessary plugins, specifically
 * the Google AI plugin for accessing models like Gemini. It exports a configured
 * `ai` instance for use in other parts of the application, such as AI flows.
 *
 * - ai: The configured Genkit AI instance.
 */

import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin
configureGenkit({
  plugins: [
    googleAI({
      // Specify the API version to ensure stability and access to the latest features.
      // 'v1beta' is often used for the latest models like Gemini 1.5 Pro.
      apiVersion: 'v1beta',
    }),
  ],
  // Log errors to the console for easier debugging.
  logLevel: 'error',
  // Enable OpenTelemetry for production monitoring and tracing.
  enableTracingAndMetrics: true,
});

export { genkit as ai };
