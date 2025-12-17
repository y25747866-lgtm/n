
'use server';

import { EbookContent, EbookContentSchema } from '@/lib/types';
import * as admin from 'firebase-admin';
import { getFunctions } from 'firebase-admin/functions';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-727493507-eef1e',
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

    const data = result.data as { ebookText?: string; coverImageUrl?: string; };

    if (!data.ebookText) {
        throw new Error('The callable function did not return valid ebook text.');
    }
    
    // The callable function returns a single string of ebook content.
    // We will parse this to fit our schema.
    const titleMatch = data.ebookText.match(/Title:\s*(.*)/);
    const subtitleMatch = data.ebookText.match(/Subtitle:\s*(.*)/);

    const ebookData: EbookContent = {
        title: titleMatch ? titleMatch[1].trim() : `Guide to ${topic}`,
        subtitle: subtitleMatch ? subtitleMatch[1].trim() : `A comprehensive overview`,
        chapters: [{
            title: "Full Manuscript",
            content: data.ebookText,
        }],
        conclusion: "This book provides a comprehensive overview of the topic. We hope you found it useful.",
        coverImageUrl: data.coverImageUrl,
    };

    const validatedEbook = EbookContentSchema.parse(ebookData);

    console.log("✅ EBOOK ACTION COMPLETE");
    return { success: true, ebook: validatedEbook };

  } catch (error: any) {
    console.error("Ebook generation action failed:", error);
    // Provide a more robust error message, checking if 'details' exists.
    const errorMessage = error?.details || error.message || "An unknown error occurred.";
    return { success: false, error: "AI GENERATION ACTION FAILED — " + errorMessage };
  }
}
