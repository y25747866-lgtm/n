
'use server';
/**
 * @fileoverview This file initializes and configures the Genkit AI instance.
 * It sets up the Google AI plugin and exports a single `ai` object for use throughout the application.
 * This centralized approach ensures that Genkit is configured consistently.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      // Specify API versions for the models if needed.
      // apiVersion: ['v1', 'v1beta'],
    }),
  ],
  // Log all traces to the console for debugging purposes.
  // In a production environment, you may want to configure a different logger.
  traceStore: 'dev-local',
  // Enable OpenTelemetry for production monitoring.
  // telemetry: {
  //   instrumentation: {
  //     // Define instrumentation configuration
  //   },
  //   sampler: {
  //     // Define sampler configuration
  //   }
  // }
});
