
'use server';
/**
 * @fileOverview Server action for triggering the ebook generation process.
 *
 * This action serves as the interface between the client-side form and the
 * server-side AI flow. It validates the input, calls the generation flow,
 * and handles storing the result in Firestore.
 */

import { generateEbookFlow } from '@/ai/flows/generate-ebook-flow';
import { initializeAdminApp } from '@/firebase/server-init';
import { EbookContent, EbookContentSchema, GenerationConfig, GenerationConfigSchema } from '@/lib/types';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize the Firebase Admin SDK to allow for server-side Firestore access.
// This is necessary because server actions run in a Node.js environment.
try {
  initializeAdminApp();
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}

// Define the shape of the successful action result.
type SuccessResult = {
  success: true;
  data: EbookContent;
};

// Define the shape of the failed action result.
type ErrorResult = {
  success: false;
  error: string;
};

// The server action can return either a success or an error object.
export type ActionResult = SuccessResult | ErrorResult;

/**
 * A server action that generates an ebook based on the provided configuration.
 *
 * @param {GenerationConfig} data - The configuration for the ebook generation.
 * @returns {Promise<ActionResult>} An object indicating success or failure.
 */
export async function generateEbookAction(data: GenerationConfig): Promise<ActionResult> {
  try {
    // 1. Validate the input data against the Zod schema.
    const validationResult = GenerationConfigSchema.safeParse(data);
    if (!validationResult.success) {
      // If validation fails, return an error with the details.
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(', ');
      return { success: false, error: errorMessage };
    }

    // 2. Call the AI flow to generate the ebook content and cover.
    const generationResult = await generateEbookFlow(validationResult.data);
    
    // 3. Validate the output from the AI flow.
    const contentValidationResult = EbookContentSchema.safeParse(generationResult);
    if (!contentValidationResult.success) {
      // This indicates a problem with the AI model's output format.
      const errorMessage = contentValidationResult.error.errors.map((e) => e.message).join(', ');
       return { success: false, error: `AI output validation failed: ${errorMessage}` };
    }

    const finalContent = contentValidationResult.data;

    // 4. (Optional) Store the generated content in Firestore.
    // In a real application, you would associate this with the logged-in user.
    try {
        const firestore = getFirestore();
        const docRef = await firestore.collection('generatedProducts').add({
            ...finalContent,
            productType: 'Ebook',
            topic: data.topic,
            generationDate: new Date().toISOString(),
        });
        console.log('Saved to Firestore with ID:', docRef.id);
    } catch (dbError: any) {
        // Log the database error but don't fail the entire action.
        // The user should still receive their content even if saving fails.
        console.error('Firestore save failed:', dbError.message);
    }


    // 5. Return the successful result to the client.
    return { success: true, data: finalContent };
  } catch (error: any) {
    // Catch any unexpected errors during the process.
    console.error('Ebook generation action failed:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
