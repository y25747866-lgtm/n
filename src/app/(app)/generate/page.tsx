
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Download, BookCheck } from "lucide-react";
import Link from "next/link";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ pdfPath: string; message: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/generate-ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }
      
      setResult({ pdfPath: data.pdfPath, message: data.message });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate e-book. Please check the console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI E-Book Generator
        </h1>
        <p className="text-muted-foreground">
          Enter a topic and let our AI craft a complete e-book for you, ready to download.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-lg">
            E-Book Topic
          </Label>
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-4 text-base h-12"
            placeholder="e.g., 'The Ultimate Guide to Digital Marketing in 2025'"
          />
        </div>

        <Button onClick={handleGenerate} disabled={!topic || loading} size="lg" className="w-full h-12 text-lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating... (this may take a few minutes)
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Your E-Book
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && (
        <div className="text-center p-8 border-2 border-dashed rounded-lg animate-fade-in">
          <BookCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Your E-book is Ready!</h2>
          <p className="text-muted-foreground mb-6">{result.message}</p>
          <Button asChild size="lg">
            <Link href={result.pdfPath} download target="_blank">
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
