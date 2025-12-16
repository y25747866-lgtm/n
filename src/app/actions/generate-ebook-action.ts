
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: 'The Ultimate Guide to Mock Data',
  subtitle: 'How to use mock data for faster development',
  chapters: [
    { title: 'Introduction to Mock Data', content: 'This is the content for the introduction chapter. It explains what mock data is and why it is useful.' },
    { title: 'Advanced Mocking Techniques', content: 'This chapter covers advanced techniques for generating and using mock data in complex applications.' },
    { title: 'Mock Data in CI/CD', content: 'Learn how to integrate mock data into your CI/CD pipelines for robust testing.' },
  ],
  conclusion: 'This is the conclusion. Mock data is a powerful tool for modern development workflows.',
  coverImageUrl: '',
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Generating ebook for topic: ${topic}`);

  try {
    // Since AI generation is removed due to dependency issues,
    // we return mock data to keep the app runnable.
    const blueprint = {
      title: 'The Ultimate Guide to Mock Data',
      subtitle: 'How to use mock data for faster development',
    };

    const coverImageUrl = generateGradientSVG(
      blueprint.title,
      blueprint.subtitle || ''
    );
    
    const finalEbook = {
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
      error: `Generation failed: ${errorMessage}`,
    };
  }
}
