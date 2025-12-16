'use server';

import { EbookContent, EbookContentSchema } from '@/lib/types';

export async function generateEbookAction(topic: string) {
  try {
    // This is now returning mock data since the AI flows were removed.
    const mockEbook: EbookContent = {
      title: "Mock Ebook Title",
      subtitle: "A subtitle for your amazing mock ebook.",
      chapters: [
        { title: "Chapter 1: The Beginning", content: "This is the content for chapter 1. It is mock content." },
        { title: "Chapter 2: The Middle", content: "This is the content for chapter 2. It is also mock content." },
        { title: "Chapter 3: The End", content: "This is the final chapter's mock content." }
      ],
      conclusion: "This is a placeholder conclusion.",
      coverImageUrl: `https://picsum.photos/seed/${topic.replace(/\s+/g, '-')}/600/800`,
      cover_image_prompt: "A mock cover prompt"
    };

    const validatedEbook = EbookContentSchema.parse(mockEbook);
    
    return {
      success: true,
      ebook: validatedEbook,
    };

  } catch (error) {
    console.error('Error in generateEbookAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred during e-book generation.',
    };
  }
}
