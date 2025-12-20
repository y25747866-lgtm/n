
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Download, Sparkles, Loader2 } from "lucide-react";

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
        setError("Please provide a topic to generate an e-book.");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred during generation.");
      }
      
      setPdfPath(data.pdfPath);
    } catch (err: any) {
      console.error(err);
      // The error from fetch or the JSON parsing will be caught here.
      // The error from the API response body is handled in the `if (!response.ok)` block.
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI E-Book Generator
        </h1>
        <p className="text-muted-foreground">
          Enter a topic below and let our AI generate a complete, professional PDF e-book for you from scratch.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-lg">
            What's your book about?
          </Label>
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full p-4 text-base"
            placeholder="e.g., 'The Ultimate Guide to Digital Marketing in 2025'"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full h-12 text-lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating... This can take a few minutes.
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
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {pdfPath && (
        <div className="p-6 bg-green-500/10 text-green-700 border border-green-500/20 rounded-lg space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-xl">Your E-Book is Ready!</h3>
            <p>Your e-book has been generated successfully.</p>
          </div>
          <a href={pdfPath} download className="w-full">
            <Button className="w-full h-12 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Download PDF
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
