
'use server';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { EbookContent } from '@/lib/types';
import { generateCoverAction } from './generate-cover-action';

// A simple utility to break text into lines that fit within a certain width.
// This is a basic implementation and might not handle all edge cases perfectly.
async function wrapText(text: string, font: any, fontSize: number, maxWidth: number) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine + word + ' ';
        const { width } = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());
    return lines;
}

export async function generatePdfAction(ebookContent: EbookContent): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const pageMargin = 50;
    const contentWidth = 595 - 2 * pageMargin; // Standard A4 width

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // --- Cover Page ---
    try {
        const { imageUrl } = await generateCoverAction(ebookContent.title, ebookContent.subtitle);
        const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
        const pdfImage = await pdfDoc.embedPng(imageBytes);

        const coverPage = pdfDoc.addPage();
        const { width, height } = coverPage.getSize();
        
        // This scales the image to fill the page, adjust as needed
        coverPage.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });
    } catch(e) {
        console.error("Could not generate or embed cover image, skipping.", e);
        // Add a simple text-based cover as fallback
        const coverPage = pdfDoc.addPage();
        const { height } = coverPage.getSize();
        coverPage.drawText(ebookContent.title, {
            x: pageMargin,
            y: height - pageMargin * 4,
            font: helveticaBoldFont,
            size: 40,
            color: rgb(0, 0, 0),
        });
        if (ebookContent.subtitle) {
            coverPage.drawText(ebookContent.subtitle, {
                x: pageMargin,
                y: height - pageMargin * 5,
                font: helveticaFont,
                size: 24,
                color: rgb(0.3, 0.3, 0.3),
            });
        }
    }


    let y = 842 - pageMargin * 2; // Standard A4 height, start from top

    const addNewPage = () => {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - pageMargin;
        return newPage;
    }

    let currentPage = addNewPage();

    for (const chapter of ebookContent.chapters) {
        // Chapter Title
        if (y < pageMargin + 40) currentPage = addNewPage();
        currentPage.drawText(chapter.title, {
            x: pageMargin,
            y,
            font: helveticaBoldFont,
            size: 24,
        });
        y -= 40;

        // Chapter Content
        const paragraphs = chapter.content.split('\n').filter(p => p.trim() !== '');
        for (const paragraph of paragraphs) {
            const lines = await wrapText(paragraph, helveticaFont, 12, contentWidth);
            for (const line of lines) {
                 if (y < pageMargin + 15) currentPage = addNewPage();
                currentPage.drawText(line, {
                    x: pageMargin,
                    y,
                    font: helveticaFont,
                    size: 12,
                });
                y -= 15;
            }
             y -= 10; // Space between paragraphs
        }
        y -= 20; // Space between chapters
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
}

    