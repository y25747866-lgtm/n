"use client";
import { useState } from "react";

export default function GeneratePage() {
  const [bookTitle, setBookTitle] = useState("");
  const [chapterTitles, setChapterTitles] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPdfPath(null);
    setError(null);
    try {
      const chaptersArray = chapterTitles
        .split("\n")
        .map(ch => ch.trim())
        .filter(ch => ch.length > 0);
        
      if (!bookTitle || chaptersArray.length === 0) {
        setError("Please provide a book title and at least one chapter title.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/generate-book", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle,
          chapterTitles: chaptersArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred");
      }

      const data = await response.json();
      setPdfPath(data.pdfPath);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Your E-Book</h1>
        <p className="text-muted-foreground">Enter your book title and chapter titles below to generate a complete PDF.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="book-title" className="block text-sm font-medium mb-1">
            Book Title
          </label>
          <input
            id="book-title"
            type="text"
            value={bookTitle}
            onChange={e => setBookTitle(e.target.value)}
            className="w-full p-2 border rounded-md bg-input"
            placeholder="e.g., The Future of Artificial Intelligence"
          />
        </div>

        <div>
          <label htmlFor="chapter-titles" className="block text-sm font-medium mb-1">
            Chapter Titles (one per line)
          </label>
          <textarea
            id="chapter-titles"
            value={chapterTitles}
            onChange={e => setChapterTitles(e.target.value)}
            rows={8}
            className="w-full p-2 border rounded-md bg-input"
            placeholder="Introduction to AI&#10;The History of Neural Networks&#10;AI in Healthcare"
          />
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:bg-muted">
        {loading ? "Generating..." : "Generate Book"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive-foreground border border-destructive rounded-md">
            <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {pdfPath && (
        <div className="mt-4 p-4 bg-green-500/10 text-green-700 border border-green-500/20 rounded-md">
          <p className="font-semibold mb-2">Book generated successfully!</p>
          <a href={pdfPath} download className="text-primary hover:underline font-medium">
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}
