
'use server';

import { EbookContent } from "@/lib/types";
import PDFDocument from "pdfkit";
import axios from "axios";

// This function runs on the server and returns a base64 string
export async function generatePdfAction(ebookContent: EbookContent): Promise<string> {
    const { title, subtitle, chapters, conclusion, coverImageUrl } = ebookContent;

    const doc = new PDFDocument({
        autoFirstPage: false,
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        size: 'A4',
        layout: 'portrait'
    });

    const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    };

    // --- Cover Page ---
    doc.addPage({ margin: 0 });
    if (coverImageUrl) {
        try {
            const coverImageResponse = await axios.get(coverImageUrl, { responseType: "arraybuffer" });
            doc.image(Buffer.from(coverImageResponse.data), 0, 0, {
                fit: [doc.page.width, doc.page.height],
                align: "center",
                valign: "center",
            });
        } catch (imgError) {
            console.warn("Could not fetch cover image, creating fallback.", imgError);
            doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#1c1c1c').fill();
        }
    } else {
        doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#1c1c1c').fill();
    }
      
    // Add a semi-transparent overlay for text readability
    doc.rect(0, doc.page.height / 2, doc.page.width, doc.page.height / 2).fillColor('black').fillOpacity(0.5).fill();
    
    doc.fillColor('white').fillOpacity(1);
    doc.fontSize(36).font('Helvetica-Bold').text(title, 50, doc.page.height / 2 + 50, { 
        width: doc.page.width - 100,
        align: "center" 
    });
    doc.moveDown(1);
    if(subtitle){
        doc.fontSize(20).font('Helvetica').text(subtitle, { 
            width: doc.page.width - 100,
            align: "center" 
        });
    }

    // --- Table of Contents ---
    doc.addPage();
    doc.fontSize(24).font('Helvetica-Bold').text("Table of Contents", { align: "center" });
    doc.moveDown(2);
      
    const tocItems = chapters.map((chapter) => chapter.title);
    tocItems.push("Conclusion");

    doc.fontSize(14).font('Helvetica').list(tocItems, {
        bulletRadius: 3,
        indent: 20,
        textIndent: 10,
        lineGap: 10,
    });


    // --- Chapters ---
    chapters.forEach((chapter) => {
        doc.addPage();
        doc.fontSize(22).font('Helvetica-Bold').text(chapter.title, { align: "left" });
        doc.moveDown(1.5);
        doc.fontSize(12).font('Helvetica').text(chapter.content, {
            align: "justify",
            lineGap: 4,
        });
    });

    // --- Conclusion ---
    doc.addPage();
    doc.fontSize(22).font('Helvetica-Bold').text("Conclusion", { align: "left" });
    doc.moveDown(1.5);
    doc.fontSize(12).font('Helvetica').text(conclusion, {
        align: "justify",
        lineGap: 4,
    });

    // Finalize the PDF and get it as a buffer
    const promise = streamToBuffer(doc);
    doc.end();
    const buffer = await promise;

    return buffer.toString('base64');
}
