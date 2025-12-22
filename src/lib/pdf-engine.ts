
import jsPDF from "jspdf";

// Helper function to load an image from a URL and return it as a Base64 string.
// This is necessary because jsPDF cannot directly handle cross-origin image URLs.
async function loadImageAsBase64(url: string): Promise<string> {
    // Use a try-catch block to handle network errors or CORS issues gracefully.
    try {
        // Use a fetch to get the image data. We add a timestamp to the URL
        // to help prevent issues with overly aggressive caching of placeholder images.
        const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();
        
        // Use FileReader to convert the image Blob to a Base64 data URL.
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error loading image for PDF, using fallback:", error);
        // Return a transparent 1x1 pixel GIF as a fallback. This prevents jsPDF from crashing
        // if the image is unavailable, and it won't be visible in the PDF.
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
  coverUrl: string;
  chapters: { title: string; content: string }[];
}) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- Cover Page ---
  const coverImageBase64 = await loadImageAsBase64(coverUrl);
  // Add the cover image, making it fill the entire A4 page.
  pdf.addImage(coverImageBase64, "JPEG", 0, 0, 210, 297); 

  // Add a semi-transparent overlay for text readability
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, 210, 297, "F");

  pdf.addImage(coverImageBase64, "JPEG", 0, 0, 210, 297);
  
  pdf.setFillColor(0,0,0);
  pdf.rect(0, 120, 210, 80, 'F');


  // Overlay the book title on the cover image.
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255); // Set text color to white for contrast.
  pdf.text(title, 105, 150, { align: "center", maxWidth: 180 });
  
  pdf.setFontSize(16);
  pdf.text(subtitle, 105, 165, { align: "center", maxWidth: 180 });


  // --- Chapters ---
  chapters.forEach((chapter) => {
    pdf.addPage();
    
    // Chapter Title
    pdf.setFontSize(22);
    pdf.setTextColor(0, 0, 0); // Reset text color to black.
    const titleLines = pdf.splitTextToSize(chapter.title, 170);
    pdf.text(titleLines, 20, 30);
    
    // Chapter Content
    pdf.setFontSize(12);
    const contentLines = pdf.splitTextToSize(chapter.content, 170);
    pdf.text(contentLines, 20, 30 + (titleLines.length * 10) + 10);
  });

  // Return the generated PDF as a Blob.
  return pdf.output("blob");
}
