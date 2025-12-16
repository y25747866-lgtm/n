import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";

// Helper function to wrap text
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const words = text.replace(/\n/g, ' \n ').split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if (word === '\n') {
            lines.push(currentLine);
            currentLine = '';
            continue;
        }
        const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}

export async function generateLongEbookPDF(
  title: string,
  chapters: { title: string; content: string }[],
  conclusion: string
) {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageMargin = 50;
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const contentWidth = pageWidth - 2 * pageMargin;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - pageMargin;

  const addNewPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - pageMargin;
  };
  
  // Title Page
  page.drawText(title, {
    x: pageMargin,
    y: y - 100,
    font: helveticaBoldFont,
    size: 28,
    maxWidth: contentWidth,
    lineHeight: 32,
  });

  addNewPage();

  // Chapters
  for (const chapter of chapters) {
    if (y < pageMargin + 100) { // Check space for title
      addNewPage();
    }
    
    // Chapter Title
    y -= 40;
    page.drawText(chapter.title, {
      x: pageMargin,
      y,
      font: helveticaBoldFont,
      size: 18,
      lineHeight: 22,
    });
    y -= 30;

    // Chapter Content
    const lines = wrapText(chapter.content, helveticaFont, 12, contentWidth);
    for (const line of lines) {
        if (y < pageMargin) {
            addNewPage();
        }
        page.drawText(line, {
            x: pageMargin,
            y,
            font: helveticaFont,
            size: 12,
            lineHeight: 15,
        });
        y -= 15;
    }
     y -= 20; // Space after chapter
  }

  // Conclusion
  if (y < pageMargin + 100) {
      addNewPage();
  }
  y -= 40;
  page.drawText('Conclusion', {
      x: pageMargin,
      y,
      font: helveticaBoldFont,
      size: 18,
      lineHeight: 22,
  });
  y -= 30;
  const conclusionLines = wrapText(conclusion, helveticaFont, 12, contentWidth);
  for (const line of conclusionLines) {
      if (y < pageMargin) {
          addNewPage();
      }
      page.drawText(line, {
          x: pageMargin,
          y,
          font: helveticaFont,
          size: 12,
          lineHeight: 15,
      });
      y -= 15;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
