
'use server';

import { generateGradientSVG } from '@/lib/svg-utils';
import { EbookContent } from '@/lib/types';

const mockEbook: EbookContent = {
  title: "The Art of Digital Creation",
  subtitle: "A Mock Guide to Online Success",
  chapters: [
    {
      title: "Chapter 1: The Idea",
      content: "This is the complete content for Chapter 1. In this chapter, we explore the genesis of an idea. It all starts with a spark of inspiration, a problem to solve, or a passion to share. We delve into brainstorming techniques, market research, and validating your concept before you write a single word. This foundational step is crucial for ensuring your final product resonates with an audience and has a place in the market. We'll cover how to identify your niche, understand your target audience's pain points, and craft a unique value proposition that sets you apart from the competition. By the end of this chapter, you'll have a rock-solid concept ready for development."
    },
    {
      title: "Chapter 2: The Content",
      content: "This is the full text for Chapter 2. Here, we get into the nitty-gritty of content creation. It's not just about writing; it's about structuring your knowledge in a way that is digestible, engaging, and valuable. We'll discuss outlining your book, creating a writing schedule, and overcoming writer's block. We will also touch on different writing styles and how to find your voice. Quality is key, and this chapter provides a framework for producing high-quality content that your readers will love. From the first draft to the final polish, you will learn the techniques used by professional authors to craft compelling narratives and clear, concise instructional text. This is where your idea begins to take tangible form."
    },
    {
        title: "Chapter 3: The Design",
        content": "This chapter covers the importance of visual appeal. A great book needs a great cover, and the interior layout is just as important. We'll discuss the principles of good design, from typography and color theory to image selection and layout. You don't need to be a professional designer to create a beautiful product. We'll show you how to use simple tools and templates to give your ebook a professional finish. A well-designed ebook not only looks good but also enhances the reading experience, making your content more accessible and enjoyable. This chapter will guide you through creating a cover that grabs attention and an interior that keeps readers engaged."
    },
    {
        "title": "Chapter 4: The Launch",
        "content": "Content creation is only half the battle. This chapter focuses on launching your product into the world. We'll cover marketing strategies, building an audience, and creating a sales funnel. From social media promotion and email marketing to running ads and collaborating with influencers, you'll learn how to generate buzz and drive sales. A successful launch requires a plan, and we'll walk you through creating a launch timeline, setting up your sales page, and tracking your key metrics. This is how you turn your hard work into a sustainable source of income and build a brand around your expertise."
    },
    {
        "title": "Chapter 5: The Empire",
        "content": "One product is a great start, but the goal is to build an empire. In this final chapter, we discuss how to scale your digital product business. This includes creating follow-up products, building a community, and exploring new revenue streams. We'll talk about turning your ebook into a course, a workshop, or a membership site. The key is to leverage your existing content and audience to create a thriving ecosystem of products and services. This chapter will give you the long-term vision and strategic mindset needed to go from a single product creator to a digital empire builder, securing your financial future and establishing yourself as an authority in your niche."
    }
  ],
  conclusion: "This is the concluding chapter of the mock e-book. We have journeyed from the initial spark of an idea to the strategies for building a digital empire. The key takeaway is that success in the digital product space is a combination of a great idea, high-quality content, smart design, and effective marketing. It's a process that requires dedication and a willingness to learn and adapt. Remember that your first product is just the beginning. Keep creating, keep learning, and keep building. The tools and strategies are at your fingertips. Now, it's time to take action and turn your vision into reality. Go forth and build your empire.",
  coverImageUrl: ""
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log("🔥 MOCK EBOOK GENERATION STARTED");
  console.time("ebook-total");

  try {
    // This is a mock implementation.
    // In a real scenario, this is where you'd call the AI generation flows.
    // For now, we return mock data after a short delay to simulate generation time.
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const coverImageUrl = generateGradientSVG(mockEbook.title, mockEbook.subtitle || '');
    
    const finalEbook: EbookContent = {
      ...mockEbook,
      coverImageUrl,
    };
    
    console.timeEnd("ebook-total");
    console.log("✅ MOCK EBOOK GENERATION FINISHED");

    return {
      success: true,
      ebook: finalEbook,
    };
  } catch (error: any) {
    console.error("Mock ebook generation failed:", error);
    console.timeEnd("ebook-total");
    return {
      success: false,
      error: error.message || 'An unknown error occurred during mock ebook generation.',
    };
  }
}
