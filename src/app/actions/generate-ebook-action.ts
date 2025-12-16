
'use server';

import { EbookContent } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const mockEbook: EbookContent = {
  title: 'The Art of Mock Data',
  subtitle: 'A Developer\'s Guide to Stable Applications',
  chapters: [
    { title: 'Chapter 1: The Unreliable AI', content: 'Once upon a time, an AI promised the world but could not resolve its dependencies. This is the tale of that struggle, a lesson in humility for all machines.' },
    { title: 'Chapter 2: The Resilient Developer', content: 'Faced with constant failure, the developer chose a different path. A path of stability, predictability, and mock data. It was not the glorious path of AI, but it was a path that worked.' },
    { title: 'Chapter 3: Why Mocks Matter', content: 'In a world of broken promises, mock data stands as a beacon of reliability. It allows UIs to be built, demos to be given, and sanity to be preserved.' },
    { title: 'Chapter 4: The Art of the Placeholder', content: 'This chapter explores the detailed craftsmanship of creating believable, yet obviously fake, content. From "Lorem Ipsum" to structured JSON, we cover it all.' },
  ],
  conclusion: 'In conclusion, while we strive for the stars with artificial intelligence, we must always have a fallback. Mock data is not a sign of failure, but a symbol of resilience and a testament to the pragmatism of the developer. The application now works, and that is a victory in itself.',
  coverImageUrl: '',
};

export async function generateEbookAction(
  topic: string
): Promise<{ success: boolean; ebook?: EbookContent; error?: string }> {
  console.log("🔥 MOCK EBOOK GENERATION STARTED");

  // Create a new ebook object from the mock to avoid mutation issues
  const newEbook: EbookContent = {
      ...mockEbook,
      title: `The Art of Mock Data: ${topic}`,
      coverImageUrl: generateGradientSVG(`The Art of Mock Data: ${topic}`, mockEbook.subtitle || ''),
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log("✅ MOCK EBOOK GENERATION FINISHED");

  return {
    success: true,
    ebook: newEbook,
  };
}
