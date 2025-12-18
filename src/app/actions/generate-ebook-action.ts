
'use server';

import { EbookContent, EbookContentSchema } from '@/lib/types';
import { getFunctions } from 'firebase-admin/functions';
import { initializeAdminApp } from '@/firebase/server-init';

// Initialize Firebase Admin SDK using the centralized function
initializeAdminApp();

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  
  console.log("🔥 EBOOK GENERATION ACTION STARTED for topic:", topic);

  try {
    const functions = getFunctions();
    const generateEbook = functions.httpsCallable('generateEbook');

    console.log("Calling Firebase Function 'generateEbook'...");
    const result = await generateEbook({ topic });
    console.log("Firebase Function returned a result.");

    // The function is expected to return an object that matches EbookContent structure
    const ebookData = result.data as EbookContent;
    
    // Validate the data structure returned from the function
    const validatedEbook = EbookContentSchema.parse(ebookData);

    console.log("✅ EBOOK ACTION COMPLETE");
    return { success: true, ebook: validatedEbook };

  } catch (error: any) {
    console.error("Ebook generation action failed:", error);
    const errorMessage = error?.message || "An unknown error occurred during generation.";
    // Check for Zod validation errors
    if (error.issues) {
      const validationErrors = error.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join(', ');
      return { success: false, error: `AI response validation failed: ${validationErrors}` };
    }
    return { success: false, error: `AI Generation Failed: ${errorMessage}` };
  }
}
