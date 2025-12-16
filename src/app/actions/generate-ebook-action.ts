
'use server';

import { generateGradientSVG } from '@/lib/svg-utils';
import { EbookContent } from '@/lib/types';

const mockEbook: EbookContent = {
  title: "The Art of Digital Creation",
  subtitle: "A Mock Guide to Online Success",
  chapters: [
    {
        title: "Chapter 1: The Idea",
        content: "This chapter is all about finding your niche and brainstorming ideas that have market potential. We'll explore how to validate your ideas without spending a dime, ensuring you're building something people actually want. From passion projects to profitable ventures, the journey starts with a single, powerful idea. This section will guide you through identifying your unique strengths and aligning them with market needs. We'll cover techniques like keyword research, competitor analysis, and trend spotting to help you uncover hidden opportunities. By the end of this chapter, you'll have a clear and validated concept for your digital product, ready to move into the creation phase."
    },
    {
        title: "Chapter 2: The Content",
        content: "Content is king, and in this chapter, we'll crown you. Learn how to structure your ebook, write compelling chapters, and keep your readers engaged from the first page to the last. We'll cover storytelling techniques, how to simplify complex topics, and the importance of a strong voice. You'll also learn about different content formats and how to choose the one that best suits your topic and audience. From outlining your structure to writing the final word, this chapter provides a complete roadmap for creating high-quality, valuable content that your readers will love and share."
    },
    {
        title: "Chapter 3: The Design",
        content: "This chapter covers the importance of visual appeal. A great book needs a great cover, and the interior layout is just as important. We'll discuss the principles of good design, from typography and color theory to image selection and layout. You don't need to be a professional designer to create a beautiful product. We'll show you how to use simple tools and templates to give your ebook a professional finish. A well-designed ebook not only looks good but also enhances the reading experience, making your content more accessible and enjoyable. This chapter will guide you through creating a cover that grabs attention and an interior that keeps readers engaged."
    },
    {
        title: "Chapter 4: The Launch",
        content: "Your product is ready, now it's time to share it with the world. This chapter details how to plan and execute a successful launch. We'll cover email marketing, social media strategies, and how to build buzz before your product even goes live. Learn how to create a simple yet effective sales page and pricing strategies that maximize your revenue. A successful launch is about momentum. We'll show you how to build it, maintain it, and leverage it for long-term success. From pre-launch teasers to post-launch follow-ups, you'll have a complete playbook for making a splash in the market."
    },
    {
        title: "Chapter 5: The Empire",
        content: "One product is a business, but multiple products are an empire. In this final chapter, we'll explore how to turn your initial success into a sustainable, long-term business. We'll discuss building a brand, creating a product ecosystem, and leveraging your audience to fuel future growth. From membership sites and online courses to physical products and affiliate marketing, we'll look at the various paths you can take to expand your digital empire. The goal is to create a business that works for you, providing passive income and a platform for your future ideas. This chapter will show you how to think bigger and build a lasting legacy."
    }
  ],
  conclusion: "In conclusion, building a digital product is a journey, but it's one that's more accessible than ever. By following the steps outlined in this book—from idea and content creation to design and launch—you have a repeatable formula for success. The key is to take action, stay consistent, and never stop learning. The digital world is full of opportunities for those willing to create value. Now it's your turn. Take what you've learned, start building, and launch your own digital empire. The world is waiting for what you have to offer.",
  coverImageUrl: '',
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  
  // This is a mock implementation and will be replaced with real AI generation.
  // We're adding a delay to simulate a real network request.
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const coverImageUrl = generateGradientSVG(mockEbook.title, mockEbook.subtitle || '');

  return {
    success: true,
    ebook: { ...mockEbook, coverImageUrl },
  };
}
