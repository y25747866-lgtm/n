
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

    const data = result.data as { ebookText?: string; coverImageUrl?: string; };

    if (!data.ebookText) {
        throw new Error('The callable function did not return valid ebook text.');
    }
    
    // Basic parsing of the returned text
    const lines = data.ebookText.split('\n');
    const titleMatch = lines.find(line => line.startsWith('Title:'));
    const subtitleMatch = lines.find(line => line.startsWith('Subtitle:'));
    
    const title = titleMatch ? titleMatch.replace('Title:', '').trim() : `Guide to ${topic}`;
    const subtitle = subtitleMatch ? subtitleMatch.replace('Subtitle:', '').trim() : `A comprehensive overview`;

    // Simple heuristic to split content into chapters
    const chapterContent = data.ebookText.split(/Chapter \d+:/).slice(1);
    const chapters = chapterContent.map((content, index) => ({
        title: `Chapter ${index + 1}`,
        content: content.trim(),
    }));

    if (chapters.length === 0) {
        // If no chapters found, treat the whole text as one chapter
        chapters.push({
            title: "Full Manuscript",
            content: data.ebookText,
        });
    }

    const ebookData: EbookContent = {
        title,
        subtitle,
        chapters,
        conclusion: "This book provides a comprehensive overview of the topic. We hope you found it useful.",
        coverImageUrl: data.coverImageUrl,
    };

    const validatedEbook = EbookContentSchema.parse(ebookData);

    console.log("✅ EBOOK ACTION COMPLETE");
    return { success: true, ebook: validatedEbook };

  } catch (error: any) {
    console.error("Ebook generation action failed:", error);
    // More robust error handling for any kind of error object
    const errorMessage = error?.message || "An unknown error occurred during generation.";
    return { success: false, error: `AI Generation Failed: ${errorMessage}` };
  }
}
