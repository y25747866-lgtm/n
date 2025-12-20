
"use client";
import { useState } from "react";

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPdfPath(null);
    setError(null);
    try {
        const response = await fetch("/api/generate-book", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookTitle: "Understanding AI: A Primer for Solo Businesses",
            chapterTitles: [
              "Introduction to AI",
              "Machine Learning Basics",
              "Natural Language Processing",
              "AI in Marketing",
              "AI in Finance",
              "AI for Customer Support",
              "Future of AI"
            ]
          })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "An unknown error occurred");
        }

        const data = await response.json();
        setPdfPath(data.pdfPath);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Book Generator</h1>
      <p className="mb-4 text-muted-foreground">Click the button to generate a full e-book on a predefined topic. This is a server-intensive process and may take several minutes.</p>
      <button 
        onClick={handleGenerate} 
        disabled={loading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:bg-muted"
      >
        {loading ? "Generating..." : "Generate Book"}
      </button>
      {pdfPath && (
        <div className="mt-4">
            <p className="text-green-500">Book generated successfully!</p>
            <a href={pdfPath} download className="text-primary hover:underline">
              Download PDF
            </a>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-500">
            <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
