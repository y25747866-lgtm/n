
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: 'The Ultimate Guide to Mock Data',
  subtitle: 'How to use mock data for faster development',
  chapters: [
    {
      title: 'Introduction to Mock Data',
      content: 'This is the full content for the introduction chapter. It explains what mock data is and why it is important for modern application development. It covers topics like fixtures, test data, and development databases.',
    },
    {
      title: 'Advanced Mocking Techniques',
      content: 'This chapter dives into more advanced techniques. You will learn about data generation libraries, API mocking, and how to create realistic and complex mock datasets for your applications.',
    },
     {
      title: 'Mocking in Production',
      content: 'A deep dive into the best practices for using mock data in a production environment. Learn how to toggle between real and mock data, and strategies for ensuring your mock data does not interfere with live user data.',
    },
  ],
  conclusion: "This is the conclusion of the book. It summarizes the key takeaways and provides some final thoughts on the future of mock data in software development.",
  coverImageUrl: 'https://picsum.photos/seed/1/600/800',
};


export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Generating ebook for topic: ${topic}`);

  // In a real app, you would call your AI generation flow here.
  // For now, we return mock data after a short delay.
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // As the AI generation is removed, we must use mock data.
    // In a real scenario, you'd throw an error if the AI fails.
    if (!topic) {
        return {
            success: false,
            error: "The topic is empty, AI generation would fail.",
        };
    }
    
    const coverImageUrl = generateGradientSVG(
      mockEbook.title,
      mockEbook.subtitle || ''
    );

    const finalEbook: EbookContent = {
      ...mockEbook,
      coverImageUrl,
    };
    
    return {
      success: true,
      ebook: finalEbook,
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
