
'use server';

import { generateGradientSVG } from '@/lib/svg-utils';
import { EbookContent } from '@/lib/types';

const mockEbook: EbookContent = {
  title: "The Art of Digital Creation",
  subtitle: "A Mock Guide to Online Success",
  chapters: [
    {
      title: "Introduction: The Digital Frontier",
      content: "This is the mock content for the introduction. It sets the stage for the journey ahead, exploring the vast possibilities of the digital world. In this chapter, we discuss the importance of a strong online presence and how to begin building your digital empire from scratch. We'll cover the foundational concepts that will be expanded upon in subsequent chapters."
    },
    {
      title: "Chapter 1: Finding Your Niche",
      content: "This is the mock content for Chapter 1. Here, we delve into the process of identifying a profitable and passionate niche. We explore market research techniques, competitor analysis, and how to validate your ideas before investing significant time and resources. This chapter is crucial for laying a solid foundation for your digital product."
    },
    {
      title: "Chapter 2: Crafting Compelling Content",
      content: "This is the mock content for Chapter 2. This chapter focuses on the heart of your digital product: the content. We cover strategies for creating engaging, valuable, and well-structured material that resonates with your target audience. From storytelling techniques to structuring your information for maximum impact, you'll learn how to write content that sells."
    }
  ],
  conclusion: "This is the mock conclusion for the e-book. It summarizes the key takeaways from each chapter and provides a clear call to action for the reader. The goal is to leave the reader inspired and equipped with the knowledge they need to succeed in their own digital endeavors. We reiterate the main points and offer final words of encouragement.",
  coverImageUrl: ""
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log("🔥 EBOOK GENERATION STARTED (MOCK)");
  console.time("ebook-total");

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const coverImageUrl = generateGradientSVG(mockEbook.title, mockEbook.subtitle);
    
    const finalEbook = {
        ...mockEbook,
        coverImageUrl,
    };
    
    console.timeEnd("ebook-total");
    console.log("✅ EBOOK GENERATION FINISHED (MOCK)");

    return {
      success: true,
      ebook: finalEbook,
    };
  } catch (error: any) {
    console.error("Mock ebook generation failed:", error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred during mock ebook generation.',
    };
  }
}
