
'use server';

import { generateEbookFlow } from '@/ai/flows/generate-ebook-flow';
import { EbookContent, EbookContentSchema } from '@/lib/types';

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  
  console.log("🔥 EBOOK GENERATION ACTION STARTED for topic:", topic);

  try {
    // This is now a direct, server-to-server function call.
    const ebookData = await generateEbookFlow(topic);
    
    // Validate the data structure returned from the flow
    const validatedEbook = EbookContentSchema.parse(ebookData);

    console.log("✅ EBOOK ACTION COMPLETE");
    return { success: true, ebook: validatedEbook };

  } catch (error: any) {
    console.error("Ebook generation action failed:", error);
    const errorMessage = error?.message || "An unknown error occurred during generation.";
    // Check for Zod validation errors, which are common with AI responses
    if (error.issues) {
      const validationErrors = error.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join(', ');
      return { success: false, error: `AI response validation failed: ${validationErrors}` };
    }
    return { success: false, error: `AI Generation Failed: ${errorMessage}` };
  }
}
