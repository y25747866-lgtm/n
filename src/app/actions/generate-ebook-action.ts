
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: "The Art of Digital Creation",
  subtitle: "A Mock Guide to Online Success",
  chapters: [
    {
      title: "Chapter 1: The Idea",
      content: "This is mock content for the first chapter. In a real book, this section would explore how to find and validate a profitable idea for your digital product. It would cover market research, identifying pain points, and ensuring there's an audience for your work. We would delve into tools and techniques for brainstorming and refining your concept until it's ready for development."
    },
    {
      title: "Chapter 2: Building Your Product",
      content: "This is mock content for the second chapter. Here, we would walk through the process of actually creating your e-book. This includes structuring your content, writing engaging copy, and designing a professional layout. We'd discuss tools for writing, editing, and formatting, ensuring your final product is polished and ready for your audience."
    },
    {
      title: "Chapter 3: Marketing and Sales",
      content: "This is mock content for the third chapter. A product is only successful if people know it exists. This chapter would cover the fundamentals of digital marketing, including building a landing page, email marketing, social media promotion, and running ads. The goal is to provide a clear roadmap for launching your product and generating sales."
    },
     {
      title: "Chapter 4: Advanced Strategies",
      content: "This is mock content for the fourth chapter. Once your product is launched, the journey isn't over. This section would cover advanced topics like building a sales funnel, creating upsells and downsells, gathering testimonials, and leveraging customer feedback to improve your offerings. We would explore how to turn a single product into a sustainable business."
    }
  ],
  conclusion: "This is the mock conclusion. In this final section, we would summarize the key takeaways from the book and provide a clear call to action. The goal is to inspire the reader to take what they've learned and apply it to their own digital product journey, empowering them to achieve their entrepreneurial goals.",
  coverImageUrl: generateGradientSVG("The Art of Digital Creation", "A Mock Guide to Online Success"),
};


export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log(`Starting MOCK e-book generation for topic: ${topic}`);

  // In this mock version, we return a pre-defined e-book after a short delay
  // to simulate the generation process.
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock e-book generation complete.');
      resolve({
        success: true,
        ebook: mockEbook,
      });
    }, 2000);
  });
}
