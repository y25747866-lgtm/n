'use server';

import { generateEbookChapter } from '@/ai/flows/generate-ebook-chapter';
import { generateEbookStructure } from '@/ai/flows/generate-ebook-structure';
import { generateEbookHTML } from '@/lib/html-generator';
import { EbookContent, EbookContentSchema } from '@/lib/types';

export async function generateEbookAction(topic: string) {
  try {
    // 1. Generate the book structure (title, chapters, etc.)
    const structure = await generateEbookStructure({ topic });

    // 2. Generate content for each chapter in parallel
    const chapterPromises = structure.chapters.map((chapterTitle) =>
      generateEbookChapter({
        bookTitle: structure.title,
        chapterTitle: chapterTitle,
      })
    );
    const chapterResults = await Promise.all(chapterPromises);

    const chapters = structure.chapters.map((title, index) => ({
      title,
      content: chapterResults[index].content,
    }));
    
    // 3. (Placeholder for Cover Generation)
    // We use a placeholder image service and pass the topic to get a unique-ish cover.
    const coverImageUrl = `https://picsum.photos/seed/${topic.replace(/\s+/g, '-')}/600/800`;

    // 4. Combine everything into the final EbookContent object
    const ebook: EbookContent = {
      title: structure.title,
      subtitle: structure.subtitle,
      chapters: chapters,
      // The last chapter serves as the conclusion
      conclusion: chapters.length > 0 ? chapters[chapters.length - 1].content : "",
      coverImageUrl: coverImageUrl,
      cover_image_prompt: structure.cover_prompt,
    };
    
    // Validate the final object
    const validatedEbook = EbookContentSchema.parse(ebook);
    
    // 5. Generate HTML for PDF conversion
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
    console.error('Error generating ebook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}
