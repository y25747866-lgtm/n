
'use server';

import {genkit} from 'genkit';
import { getApiKey } from '@/lib/firebase';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(async () => ({
      apiKey: await getApiKey("GEMINI_API_KEY"),
    })),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
