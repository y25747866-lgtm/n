
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  try {
    // This is now returning mock data to avoid dependency issues.
    const mockBlueprint = {
      title: "The Ultimate Guide to Mock Data",
      subtitle: "How to Use Placeholders Effectively",
      chapters: [
        "Introduction to Mocking",
        "Advanced Placeholder Strategies",
        "Debugging with Mock Data",
        "Mock Data in Production",
        "The Future of Mocking",
        "Case Study: Mocking at Scale",
        "Interview with a Mock Data Expert",
        "Common Mocking Pitfalls",
        "Conclusion: The Power of Mock",
        "Appendix: Mock Data Cheatsheet"
      ],
    };

    const mockChapters = mockBlueprint.chapters.map((title) => ({
      title: title,
      content: `This is the mock content for the chapter titled "${title}". It is a placeholder to ensure the application can build and run without the genkit AI dependencies. Replace this with real content generation when the dependency issues are resolved.`
    }));

    const ebook: EbookContent = {
      title: mockBlueprint.title,
      subtitle: mockBlueprint.subtitle,
      chapters: mockChapters,
      conclusion:
        'This is a placeholder conclusion. A dedicated AI flow should be implemented to generate a meaningful summary and call to action.',
      coverImageUrl: generateGradientSVG(mockBlueprint.title, mockBlueprint.subtitle, 'ai'),
    };

    return {
      success: true,
      ebook: ebook,
    };
  } catch (error) {
    console.error('Error in generateEbookAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during e-book generation.',
    };
  }
}
