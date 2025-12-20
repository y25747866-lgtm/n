
"use server";

import { generateChapter } from "./generate-chapter-action";
import { generateCover } from "./generate-cover-action";
import { generatePDF } from "./generate-pdf-action";
import { generateReportAction } from "./generate-report-action";

// A simple parser for the structured text format
function parseEbookOutline(outlineText: string) {
    const lines = outlineText.split('\n').filter(line => line.trim() !== '');
    
    const title = lines.find(line => line.startsWith('BOOK_TITLE:'))?.replace('BOOK_TITLE:', '').trim() || 'Untitled';
    const chapterLines = lines.slice(lines.findIndex(line => line.startsWith('TABLE_OF_CONTENTS:')) + 1);
    
    const chapterTitles = chapterLines
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title && !title.startsWith('---'));

    return { title, chapterTitles };
}


export async function generateBook(topic: string) {

  // 1. Generate the outline
  const outlineResult = await generateReportAction(topic);
  if (!outlineResult.content) {
    throw new Error("Failed to generate ebook outline.");
  }
  const { title: bookTitle, chapterTitles } = parseEbookOutline(outlineResult.content);

  // 2. Generate each chapter's content
  const chapters: { title: string, content: string }[] = [];
  for (const title of chapterTitles) {
    const content = await generateChapter(bookTitle, title);
    chapters.push({ title, content });
  }

  // 3. Generate the cover image
  const coverUrl = await generateCover(bookTitle);

  // 4. Generate the PDF
  const pdfPath = await generatePDF(bookTitle, chapters, coverUrl);

  return { chapters, coverUrl, pdfPath };
}
