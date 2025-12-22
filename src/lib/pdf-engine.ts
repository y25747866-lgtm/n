import jsPDF from "jspdf";

export function buildEbookPdf({
  title,
  coverUrl,
  chapters,
}: {
  title: string;
  coverUrl: string;
  chapters: { title: string; content: string }[];
}) {
  const pdf = new jsPDF();

  // We can't add images from URLs directly on the client side due to CORS.
  // A real implementation would fetch the image via a server-side proxy
  // or use a base64-encoded image data URI if available.
  // For this example, we'll skip adding the image but keep the text.

  // Cover
  pdf.setFontSize(26);
  pdf.text(title, 105, 40, { align: "center" });

  // pdf.addImage(coverUrl, "JPEG", 30, 60, 150, 200);

  pdf.addPage();

  // Chapters
  chapters.forEach((ch, index) => {
    if (index !== 0) pdf.addPage();

    pdf.setFontSize(18);
    pdf.text(ch.title, 20, 30);

    pdf.setFontSize(12);
    // jsPDF's text wrapping is basic. For complex markdown, a more
    // sophisticated renderer would be needed (e.g., html2canvas + jsPDF).
    // We'll split by newline for a simple approach.
    const lines = pdf.splitTextToSize(ch.content, 170);
    pdf.text(lines, 20, 45);
  });

  return pdf.output("blob");
}
