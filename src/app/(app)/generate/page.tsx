"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Download, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please provide a topic.");
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await fetch("/api/generate-ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An unknown error occurred during generation.");
      }
      
      setGeneratedContent(data.content);

    } catch (err: any) {
      console.error("Fetch or API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI E-Book Generator
        </h1>
        <p className="text-muted-foreground">
          Enter a topic below and let our AI generate a complete e-book for you.
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

      {generatedContent && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Generated Content</h3>
          <Textarea 
            readOnly
            value={generatedContent}
            className="w-full h-96 text-sm bg-muted/50"
            />
            <p className="text-sm text-muted-foreground">You can now copy this content and use a PDF generator to create your final e-book.</p>
        </div>
      )}
    </div>
  );
}
