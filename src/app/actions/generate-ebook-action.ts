
'use server';

import { EbookContent, EbookContentSchema } from '@/lib/types';
import * as admin from 'firebase-admin';
import { getFunctions } from 'firebase-admin/functions';
import { v4 as uuidv4 } from 'uuid';

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

    if (!data.ebook || !data.ebook.chapters || data.ebook.chapters.length === 0) {
        throw new Error('The callable function did not return valid ebook content.');
    }
    
    // The callable function returns an object with `chapters` and `coverImageUrl`
    // We shape this into the EbookContent schema, creating placeholders for now.
    const ebookData: EbookContent = {
        title: `Comprehensive Guide to ${topic}`, // Placeholder title
        subtitle: `Mastering the art of ${topic}`, // Placeholder subtitle
        chapters: data.ebook.chapters.map((content: string, index: number) => ({
            title: `Chapter ${index + 1}: Getting Started`, // Placeholder chapter title
            content: content
        })),
        conclusion: "This is a placeholder conclusion. The AI will write this in a future step.",
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
