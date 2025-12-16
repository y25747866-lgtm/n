
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: "The Ultimate Guide to Mock Data",
  subtitle: "How to Use Mock Data for Robust Development",
  chapters: [
    { title: "Introduction to Mock Data", content: "This is the full content for the introduction chapter. It explains what mock data is and why it's crucial for modern development workflows, especially in testing and UI prototyping..." },
    { title: "Advanced Mocking Techniques", content: "This chapter dives into more advanced techniques. You will learn about generating realistic data sets, mocking server responses, and using libraries to streamline the process..." },
    { title: "Mocking in CI/CD Pipelines", content: "Explore how to integrate mock data generation into your continuous integration and deployment pipelines to ensure your tests are always running against consistent and predictable data..." },
  ],
  conclusion: "In conclusion, mock data is an indispensable tool for any development team. By mastering the techniques discussed in this book, you can significantly improve the quality and speed of your development cycle. This is the full, real conclusion.",
  coverImageUrl: "" 
};


export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Starting mock ebook generation for topic: ${topic}`);

  // In a real scenario, you would generate based on the topic.
  // For this mock, we'll just use the predefined content but generate a new cover.
  const title = mockEbook.title;
  const subtitle = mockEbook.subtitle;

  try {
    // Generate a cover image based on the title and subtitle
    const coverImageUrl = generateGradientSVG(title, subtitle);
    console.log('Generated mock cover image SVG.');

    const ebookWithCover = {
        ...mockEbook,
        coverImageUrl,
    };
    
    console.log('Mock ebook generation complete.');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      ebook: ebookWithCover,
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
