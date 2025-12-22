
import jsPDF from "jspdf";

// Helper function to load an image from a URL and return it as a Base64 string.
// This is necessary because jsPDF cannot directly handle cross-origin image URLs.
async function loadImageAsBase64(url: string): Promise<string> {
    try {
        // Use a timestamp to bypass aggressive browser caching for placeholder images
        const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
        const res = await fetch(fetchUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();
        
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(`FileReader error: ${error}`);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error loading image for PDF, using fallback:", error);
        // Return a transparent 1x1 pixel GIF as a fallback.
        // This prevents jsPDF from crashing if the image is unavailable.
        return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }
}


export async function buildEbookPdf({
  title,
  subtitle,
  coverUrl,
  chapters,
}: {
  title: string;
  subtitle: string;
  coverUrl:string;
  chapters: { title: string; content: string }[];
}) {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;

    // Helper function to add wrapped text with page breaks
    function addTextWithPageBreak(text: string, startY: number, options: { isTitle: boolean }) {
        if (options.isTitle) {
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
        } else {
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
        }

        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        let y = startY;

        for (const line of lines) {
            if (y + lineHeight > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }
            pdf.text(line, margin, y);
            y += options.isTitle ? lineHeight * 1.5 : lineHeight;
        }
        return y;
    }

    // --- Cover Page ---
    try {
        const coverImageBase64 = await loadImageAsBase64(coverUrl);
        pdf.addImage(coverImageBase64, "JPEG", 0, 0, pageWidth, pageHeight);
    } catch (e) {
        console.error("Could not add cover image to PDF", e);
        pdf.setFillColor(20, 20, 40);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    pdf.setFillColor(0, 0, 0);
    pdf.setGState(new pdf.GState({opacity: 0.6}));
    pdf.rect(0, pageHeight / 2 - 30, pageWidth, 80, 'F');
    pdf.setGState(new pdf.GState({opacity: 1}));

    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    const titleLines = pdf.splitTextToSize(title, pageWidth - (margin * 2));
    pdf.text(titleLines, pageWidth / 2, pageHeight / 2 - 10, { align: "center" });

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "normal");
    const subtitleY = pageHeight / 2 - 10 + (titleLines.length * 12);
    pdf.text(subtitle, pageWidth / 2, subtitleY, { align: "center" });

    // --- Chapters ---
    chapters.forEach((chapter, idx) => {
        pdf.addPage();
        pdf.setTextColor(0, 0, 0);
        
        let y = margin;
        
        y = addTextWithPageBreak(chapter.title, y, { isTitle: true });
        y += lineHeight; 
        
        addTextWithPageBreak(chapter.content, y, { isTitle: false });
    });

  return pdf.output("blob");
}
