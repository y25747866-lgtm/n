
"use server";

import { jsPDF } from "jspdf";
import fs from "fs/promises";
import path from "path";

export async function generatePDF(bookTitle: string, chapters: { title: string, content: string }[], coverUrl?: string) {
  const doc = new jsPDF();

  // Add cover
  if (coverUrl) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(coverUrl);
        const imageBuffer = await response.arrayBuffer();
        const imageExtension = coverUrl.split('.').pop()?.split('?')[0].toUpperCase() || 'PNG';

        doc.addImage(
            new Uint8Array(imageBuffer),
            imageExtension,
            0,
            0,
            doc.internal.pageSize.getWidth(),
            doc.internal.pageSize.getHeight()
        );
        doc.addPage();
    } catch(e) {
        console.error("Failed to add cover image to PDF:", e);
        // Continue without cover
    }
  }

  // Add chapters
  chapters.forEach(chap => {
    doc.setFontSize(18);
    doc.text(chap.title, 20, 30);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(chap.content, 170);
    doc.text(lines, 20, 40);
    if (chapters.indexOf(chap) < chapters.length - 1) {
        doc.addPage();
    }
  });

  const pdfPath = path.join(process.cwd(), 'public', `${bookTitle.replace(/\s+/g, "_")}.pdf`);
  await fs.writeFile(pdfPath, doc.output('arraybuffer'));

  return `/${bookTitle.replace(/\s+/g, "_")}.pdf`;
}
