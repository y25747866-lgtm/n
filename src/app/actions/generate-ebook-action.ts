'use server';

import { generateEbookHTML } from '@/lib/html-generator';
import { EbookContent, EbookContentSchema } from '@/lib/types';

export async function generateEbookAction(topic: string) {
  try {
    // MOCK DATA
    const structure = {
      title: `Mock Ebook about ${topic}`,
      subtitle: 'A subtitle for your mock ebook',
      chapters: Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}: Title`),
      cover_prompt: 'A mock cover prompt',
    };

    const chapters = structure.chapters.map((title, index) => ({
      title,
      content: `This is the mock content for chapter ${index + 1}.`,
    }));
    
    const coverImageUrl = `https://picsum.photos/seed/${topic.replace(/\s+/g, '-')}/600/800`;

    const ebook: EbookContent = {
      title: structure.title,
      subtitle: structure.subtitle,
      chapters: chapters,
      conclusion: "This is the mock conclusion for the ebook.",
      coverImageUrl: coverImageUrl,
      cover_image_prompt: structure.cover_prompt,
    };
    
    const validatedEbook = EbookContentSchema.parse(ebook);
    
    const ebookHtml = generateEbookHTML(
        validatedEbook.title,
        validatedEbook.subtitle || '',
        validatedEbook.chapters
    );

    return {
      success: true,
      ebook: validatedEbook,
      htmlContent: ebookHtml,
    };

  } catch (error) {
    console.error('Error generating mock ebook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}
