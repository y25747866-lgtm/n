
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
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20;

  // --- Cover Page ---
  try {
      const coverImageBase64 = await loadImageAsBase64(coverUrl);
      pdf.addImage(coverImageBase64, "JPEG", 0, 0, pageWidth, pageHeight);
  } catch (e) {
      console.error("Could not add cover image to PDF", e);
      pdf.setFillColor(20, 20, 40);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Add a semi-transparent overlay for text readability
  pdf.setFillColor(0, 0, 0);
  pdf.setGState(new pdf.GState({opacity: 0.6}));
  pdf.rect(0, 120, pageWidth, 80, 'F');
  pdf.setGState(new pdf.GState({opacity: 1}));

  // Add Title and Subtitle to Cover
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  const titleLines = pdf.splitTextToSize(title, pageWidth - (margin * 2));
  pdf.text(titleLines, pageWidth / 2, 140, { align: "center" });
  
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "normal");
  const subtitleY = 140 + (titleLines.length * 12);
  pdf.text(subtitle, pageWidth / 2, subtitleY, { align: "center" });

  // --- Chapters ---
  chapters.forEach((chapter, index) => {
    pdf.addPage();
    pdf.setTextColor(0, 0, 0); // Reset text color
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    
    // Chapter Title
    const chapterTitleLines = pdf.splitTextToSize(chapter.title, pageWidth - (margin * 2));
    pdf.text(chapterTitleLines, margin, 30);
    
    // Chapter Content
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const contentLines = pdf.splitTextToSize(chapter.content, pageWidth - (margin * 2));
    let cursorY = 30 + (chapterTitleLines.length * 10) + 10;
    
    for(const line of contentLines) {
        if (cursorY > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
        }
        pdf.text(line, margin, cursorY);
        // Approximate line height. jsPDF doesn't have great automatic line height handling.
        cursorY += 5; 
    }
  });

  // Return the generated PDF as a Blob.
  return pdf.output("blob");
}

    