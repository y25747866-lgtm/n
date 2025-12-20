"use client";
import { useState } from "react";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPdfPath(null);
    setError(null);
    try {
      if (!topic) {
        setError("Please provide a topic.");
        setLoading(false);
        return;
      }
      
      const response = await fetch("/api/generate-book", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred");
      }

      const data = await response.json();
      setPdfPath(data.pdfPath); // Path to generated PDF
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
        <p className="text-muted-foreground">Enter a topic below and let the AI generate a complete PDF e-book for you.</p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="topic" className="block text-sm font-medium mb-1">
          Topic
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="w-full max-w-lg p-2 border rounded-md bg-input"
          placeholder="e.g., 'Getting started with sourdough baking'"
        />
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
