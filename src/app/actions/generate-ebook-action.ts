
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: 'The Ultimate Guide to Mock Data',
  subtitle: 'How to use mock data for faster development',
  chapters: [
    {
      title: 'Introduction to Mock Data',
      content: 'This is the full content for the introduction chapter. It explains what mock data is and why it is useful for developers, especially in the early stages of a project. It covers the benefits of decoupling frontend and backend development.',
    },
    {
      title: 'Advanced Mocking Techniques',
      content: 'This chapter delves into more advanced techniques for mocking data. It includes topics like dynamic mock data generation, using libraries like Faker.js, and creating mock API servers to simulate real-world scenarios.',
    },
    {
      title: 'Integrating Mock Data in Your CI/CD Pipeline',
      content: 'Learn how to integrate mock data into your continuous integration and continuous delivery (CI/CD) pipeline. This ensures that your tests are consistent and that your application can be built and deployed reliably without depending on a live backend.',
    },
  ],
  conclusion: 'This is the conclusion of the book. It summarizes the key takeaways and provides some final thoughts on the best practices for using mock data in modern web development.',
  coverImageUrl: '',
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Starting ebook generation for topic: ${topic}`);

  // Since AI packages are removed, we return mock data.
  if (true) {
    const coverImageUrl = generateGradientSVG(
      mockEbook.title,
      mockEbook.subtitle || ''
    );
    return {
      success: true,
      ebook: {
        ...mockEbook,
        coverImageUrl,
      },
    };
  }

  // The following code is unreachable but kept for reference
  try {
    console.log('This part of the code should not be reached.');
    
    return {
      success: false,
      error: `Generation failed: AI components are currently disabled due to package installation issues.`,
    };

  } catch (error) {
    console.error('Error in generateEbookAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during e-book generation.';
    
    return {
      success: false,
      error: `Generation failed: ${errorMessage}`,
    };
  }
}
