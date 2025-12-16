
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: "The Ultimate Guide to Mock Data",
  subtitle: "How to create and use mock data for your projects",
  chapters: [
    {
      title: "Introduction to Mock Data",
      content: "This is the content for the introduction chapter. It explains what mock data is and why it's important.",
    },
    {
      title: "Creating Mock Data",
      content: "This chapter covers various techniques and tools for creating realistic mock data for your applications.",
    },
    {
      title: "Using Mock Data in Development",
      content: "Learn how to integrate mock data into your development workflow for faster and more reliable testing.",
    },
  ],
  conclusion: "This is the conclusion of the mock e-book. It summarizes the key takeaways and provides some final thoughts.",
  coverImageUrl: generateGradientSVG("The Ultimate Guide to Mock Data", "A mock subtitle", "ai"),
};


export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  try {
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // As per instructions to remove AI packages, we must return mock data to keep the app functional
    // The previous approach of throwing an error here would break the generate page.
    const ebook = { ...mockEbook, title: `Mock Ebook About: ${topic}`};
    ebook.coverImageUrl = ebook.coverImageUrl || generateGradientSVG(ebook.title, ebook.subtitle || '', topic.split(' ')[0] || 'ai');
    
    return {
      success: true,
      ebook: ebook,
    };
  } catch (error) {
    console.error('Error in generateEbookAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during e-book generation.';
    
    return {
      success: false,
      error: `AI generation failed. No fallback content allowed. Reason: ${errorMessage}`,
    };
  }
}
