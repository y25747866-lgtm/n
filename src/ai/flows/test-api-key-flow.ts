
'use server';

/**
 * @fileOverview A simple flow to test the Gemini API key.
 *
 * - testApiKey - A function that makes a simple generation call.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TestApiKeyOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type TestApiKeyOutput = z.infer<typeof TestApiKeyOutputSchema>;

async function testApiKey(): Promise<TestApiKeyOutput> {
  try {
    const { text } = await ai.generate({
      prompt: 'Say "hello".',
    });

    if (text) {
      return { success: true, message: 'API key is valid and working!' };
    } else {
      throw new Error('API returned an empty response.');
    }
  } catch (error: any) {
    console.error('API Key Test Failed:', error);
    let message = 'An unknown error occurred.';
    if (error.message) {
      // Extract the relevant part of the error for the user.
      if (error.message.includes('API key not valid')) {
        message = 'API key not valid. Please check your .env file and ensure GEMINI_API_KEY is correct.';
      } else {
        message = error.message;
      }
    }
    return { success: false, message: `Test failed: ${message}` };
  }
}

ai.defineFlow(
  {
    name: 'testApiKeyFlow',
    outputSchema: TestApiKeyOutputSchema,
  },
  testApiKey
);

// Export the wrapper function for use in components
export { testApiKey };
