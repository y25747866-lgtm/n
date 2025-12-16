
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: 'The Ultimate Guide to Mock Data',
  subtitle: 'How to use mock data for faster development',
  chapters: [
    { title: 'Introduction to Mock Data', content: 'This is the full content for the introduction. Mock data is essential for rapid prototyping and testing without relying on a live backend. It allows frontend developers to build and style components with realistic data structures.' },
    { title: 'Advanced Mocking Techniques', content: 'This chapter covers advanced techniques. You can use libraries like Faker.js to generate more realistic and varied mock data. This includes names, addresses, and even paragraphs of text.' },
    { title: 'Integrating Mock Data in Your Workflow', content: 'Here, we discuss integration. Setting up mock servers or using build-in features of modern frontend frameworks can streamline the process of using mock data throughout your development lifecycle.' },
    { title: 'Testing with Mock Data', content: 'This is the full content for the testing chapter. Learn how to write unit and integration tests that use mock data to ensure your components behave correctly under different data scenarios.' },
    { title: 'From Mock to Production', content: 'The final chapter on moving to production. We will explore strategies for switching from a mock data source to a live API, including managing environment variables and handling potential data schema differences.' },
  ],
  conclusion: "In conclusion, mock data is a powerful tool. By mastering its use, you can significantly speed up your development process, improve testing, and build more robust applications. This guide has provided you with the foundational knowledge to get started.",
  coverImageUrl: '',
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Starting ebook generation for topic: ${topic}`);

  try {
    // Since AI packages are removed, we generate a mock ebook.
    const ebook = { ...mockEbook };
    
    // Generate a new cover based on the mock title.
    ebook.coverImageUrl = generateGradientSVG(
      ebook.title,
      ebook.subtitle || ''
    );
    console.log('Generated mock ebook and cover image SVG.');

    return {
      success: true,
      ebook,
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
