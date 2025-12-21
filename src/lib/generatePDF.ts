
import PDFDocument from "pdfkit";
import fs from "fs";
import axios from "axios";

interface Chapter {
  title: string;
  content: string;
}

interface EbookData {
  coverUrl: string; // URL of cover image
  title: string;
  subtitle: string;
  chapters: Chapter[];
  outputFilePath: string; // e.g., "./public/generated-books/ebook.pdf"
}

export async function generateEbookPDF(data: EbookData) {
  const { coverUrl, title, subtitle, chapters, outputFilePath } = data;

  return new Promise<void>(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        autoFirstPage: false,
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        size: 'A4',
        layout: 'portrait'
      });
      
      const stream = fs.createWriteStream(outputFilePath);
      doc.pipe(stream);

      // --- Cover Page ---
      doc.addPage({ margin: 0 });
      try {
        const coverImage = await axios.get(coverUrl, { responseType: "arraybuffer" });
        // This will scale the image to fill the entire page
        doc.image(Buffer.from(coverImage.data), 0, 0, {
          fit: [doc.page.width, doc.page.height],
          align: "center",
          valign: "center",
        });
      } catch (imgError) {
        console.warn("Could not fetch cover image, skipping.", imgError);
        // Optional: draw a fallback background
        doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('gray').fill();
      }
      
      // Add a semi-transparent overlay for text readability
      doc.rect(0, doc.page.height / 2, doc.page.width, doc.page.height / 2).fillColor('black').fillOpacity(0.5).fill();
      
      doc.fillColor('white').fillOpacity(1); // Reset opacity for text
      doc.fontSize(36).font('Helvetica-Bold').text(title, 50, doc.page.height / 2 + 50, { 
        width: doc.page.width - 100,
        align: "center" 
      });
      doc.moveDown(1);
      doc.fontSize(20).font('Helvetica').text(subtitle, { 
        width: doc.page.width - 100,
        align: "center" 
      });


      // --- Table of Contents ---
      doc.addPage();
      doc.fontSize(24).font('Helvetica-Bold').text("Table of Contents", { align: "center" });
      doc.moveDown(2);
      
      const tocItems = chapters.map((chapter, index) => {
        // We can't know the page number yet, so we'll add it later if needed,
        // or just list the chapters. For simplicity, we'll just list them.
        return `${chapter.title}`;
      });

      doc.fontSize(14).font('Helvetica').list(tocItems, {
          bulletRadius: 3,
          indent: 20,
          textIndent: 10,
          lineGap: 10,
      });


      // --- Chapters ---
      chapters.forEach((chapter) => {
        doc.addPage();
        // Header
        doc.fontSize(10).font('Helvetica-Oblique')
           .text(`${title}`, { align: 'center', continued: false });
        doc.moveDown(0.5);

        // Chapter Title
        doc.fontSize(22).font('Helvetica-Bold').text(chapter.title, { align: "left" });
        doc.moveDown(1.5);
        
        // Chapter Content
        doc.fontSize(12).font('Helvetica').text(chapter.content, {
          align: "justify",
          lineGap: 4,
        });

        // Footer with page number
         const range = doc.bufferedPageRange(); // Get the range of pages
         for (let i = range.start; i < range.start + range.count; i++) {
            if (i > 1) { // Skip page number on cover
              doc.switchToPage(i);
              // Add page number to the bottom
              doc.fontSize(10).font('Helvetica').text(`Page ${i - 1}`, 
                0, 
                doc.page.height - 50, // Position at the bottom
                { align: 'center' }
              );
            }
         }

      });

      doc.end();
      stream.on("finish", () => resolve());
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}
