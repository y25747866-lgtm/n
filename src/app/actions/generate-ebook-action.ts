
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
import { getAuth } from 'firebase-admin/auth';


// Initialize the Firebase Admin SDK to allow for server-side Firestore access.
// This is necessary because server actions run in a Node.js environment.
try {
  initializeAdminApp();
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}

// Define the shape of the successful action result.
export type SuccessResult = {
  success: true;
  data: EbookContent;
};

// Define the shape of the failed action result.
export type ErrorResult = {
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

    // This is a temporary measure, in a real app you'd get the user from the session
    const tempUserId = "user_placeholder_id";

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

    // 4. Store the generated content in Firestore.
    try {
        const firestore = getFirestore();
        const docRef = firestore.collection('users').doc(tempUserId).collection('generatedProducts').doc();
        
        await docRef.set({
            id: docRef.id,
            userId: tempUserId,
            ...finalContent,
            productType: 'Ebook',
            topic: data.topic,
            generationDate: new Date().toISOString(),
        });
        console.log('Saved to Firestore with ID:', docRef.id);
    } catch (dbError: any) {
        console.error('Firestore save failed:', dbError.message);
        // We are not returning the error to the user, because the content generation itself was successful.
        // In a production app, you would want to have more robust error handling here,
        // perhaps queuing the save operation for a retry.
    }


    // 5. Return the successful result to the client.
    return { success: true, data: finalContent };
  } catch (error: any) {
    // Catch any unexpected errors during the process.
    console.error('Ebook generation action failed:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
