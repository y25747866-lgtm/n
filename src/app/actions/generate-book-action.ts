
"use server";

import { generateChapter } from "./generate-chapter-action";
import { generateCover } from "./generate-cover-action";
import { generatePDF } from "./generate-pdf-action";

export async function generateBook(bookTitle: string, chapterTitles: string[]) {
  const chapters: { title: string, content: string }[] = [];

  for (const title of chapterTitles) {
    const content = await generateChapter(bookTitle, title);
    chapters.push({ title, content });
  }

  const coverUrl = await generateCover(bookTitle);
  const pdfPath = await generatePDF(bookTitle, chapters, coverUrl);

  return { chapters, coverUrl, pdfPath };
}
