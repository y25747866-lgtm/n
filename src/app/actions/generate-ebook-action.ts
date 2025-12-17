
'use server';

import { EbookContent, EbookContentSchema } from '@/lib/types';
import * as admin from 'firebase-admin';
import { getFunctions } from 'firebase-admin/functions';

// Initialize Firebase Admin SDK
// This should only happen once per server instance.
if (!admin.apps.length) {
  // When running locally, it will use the service account credentials
  // In a deployed environment (like Vercel), it uses GOOGLE_APPLICATION_CREDENTIALS
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-727493507-eef1e', // Fallback for safety
  });
}


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

    const data = result.data as { success: boolean; ebook?: any; error?: string };

    if (!data.success || !data.ebook) {
        throw new Error(data.error || 'The callable function returned a failure state.');
    }
    
    // The callable function returns an object with `chapters` and `coverImageUrl`
    // We need to shape this into the EbookContent schema.
    const ebookData: EbookContent = {
        title: "Title from AI (Not Implemented)", // This needs to be returned from the function
        subtitle: "Subtitle from AI (Not Implemented)",
        chapters: data.ebook.chapters.map((content: string, index: number) => ({
            title: `Chapter ${index + 1}`, // Placeholder title
            content: content
        })),
        conclusion: "Conclusion from AI (Not Implemented)",
        coverImageUrl: data.ebook.coverImageUrl,
    };

    const validatedEbook = EbookContentSchema.parse(ebookData);

    console.log("✅ EBOOK ACTION COMPLETE");
    return { success: true, ebook: validatedEbook };

  } catch (error: any) {
    console.error("Ebook generation action failed:", error);
    // The error from a callable function has a 'details' property
    const errorMessage = error.details || error.message || "An unknown error occurred.";
    return { success: false, error: "AI GENERATION ACTION FAILED — " + errorMessage };
  }
}
