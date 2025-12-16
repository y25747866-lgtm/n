import { PDFDocument, StandardFonts } from "pdf-lib";

export async function generateLongEbookPDF(
  title: string,
  chapters: { title: string; content: string }[],
  conclusion: string
) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function newPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  function drawText(text: string, size = fontSize) {
    const lines = text.split("\n");
    for (const line of lines) {
      if (y < margin) newPage();
      page.drawText(line, {
        x: margin,
        y,
        size,
        font,
        maxWidth: pageWidth - margin * 2,
        lineHeight,
      });
      y -= lineHeight;
    }
  }

  // Title page
  drawText(title, 24);
  y -= 40;

  // Chapters
  for (const chapter of chapters) {
    drawText(`\n${chapter.title}\n`, 18);
    drawText(chapter.content);
    y -= 20;
  }

  // Conclusion
  drawText(`\nConclusion\n`, 18);
  drawText(conclusion);

  return await pdf.save();
}
