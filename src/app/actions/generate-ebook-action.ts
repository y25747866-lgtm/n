
'use server';

import { EbookContent } from '@/lib/types';

// Mock data to be returned by the action
const mockEbook: EbookContent = {
  title: 'The Ultimate Guide to Mock Data',
  subtitle: 'How to Use Mock Data for Robust Development',
  chapters: [
    { title: 'Introduction to Mocking', content: 'This is the content for the introduction. It explains what mocking is and why it is important.' },
    { title: 'Advanced Mocking Techniques', content: 'This chapter covers advanced techniques for mocking data and services.' },
  ],
  conclusion: 'This is the conclusion of the mock e-book.',
  coverImageUrl: 'https://picsum.photos/seed/1/600/800',
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Generating ebook for topic: ${topic}`);
  
  // Simulate an AI generation process
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // In a real scenario, you would call your AI generation flows here.
    // For now, we return mock data.
    
    return {
      success: true,
      ebook: mockEbook,
    };

  } catch (error) {
    console.error('Error in generateEbookAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during e-book generation.';
    
    // As per the requirement, throw an error if generation fails.
    // In this mock setup, we can simulate a failure if needed.
    // For now, we just return an error message.
    return {
      success: false,
      error: `AI generation failed. No fallback content allowed. Reason: ${errorMessage}`,
    };
  }
}
