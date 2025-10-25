"use client";

import {
  Download,
  Edit,
  FileText,
  FileArchive,
  RefreshCw,
  Share2,
  Save,
  Palette,
  LayoutTemplate,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { GenerateEbookContentOutput } from "@/ai/flows/generate-ebook-content";
import { GenerateCoverImageOutput } from "@/ai/flows/generate-cover-image";
import { regenerateCoverImage } from "@/ai/flows/regenerate-cover-image";
import { GenerationParams } from "./unified-progress-modal";

type ProductResult = {
  content: GenerateEbookContentOutput;
  cover: GenerateCoverImageOutput;
  params: GenerationParams;
}

export function ProductPackagePreview({ productResult }: { productResult: ProductResult }) {
  const [title, setTitle] = useState(productResult.content.title);
  const [coverImageUrl, setCoverImageUrl] = useState(productResult.cover.imageUrl);
  const [isRegenerating, startRegenerateTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = (actionName: string, delay = 1000) => {
    const { id } = toast({
      title: `Starting ${actionName}...`,
      description: "Please wait while we process your request.",
    });
    setTimeout(() => {
      toast({
        id,
        title: `${actionName} Successful!`,
        description: "Your file is ready.",
        variant: "default",
      });
    }, delay);
  };

  const handleRegenerateCover = () => {
    startRegenerateTransition(async () => {
      const { id } = toast({
        title: 'Regenerating Cover...',
        description: 'AI is creating a new cover variant.',
      });
      try {
        const result = await regenerateCoverImage({
          topic: productResult.params.topic,
          title: title,
          authorName: productResult.params.authorName,
          coverStyle: productResult.params.coverStyle,
          imageModel: productResult.params.imageModel,
        });
        setCoverImageUrl(result.coverImageUrl);
        toast.update(id, {
          title: 'Cover Regenerated!',
          description: 'The new cover has been applied.',
          variant: 'default',
        });
      } catch (error) {
        toast.update(id, {
          title: 'Regeneration Failed',
          description: 'Could not generate a new cover. Please try again.',
          variant: 'destructive',
        });
        console.error(error);
      }
    });
  }
  
  return (
    <div className="flex flex-col h-full">
      <DialogHeader>
        <DialogTitle className="text-2xl">Generation Complete!</DialogTitle>
        <DialogDescription>
          Your new digital product is ready. Preview, customize, and export below.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 mt-6 overflow-hidden">
        {/* Left Column: Cover Preview */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden border bg-muted">
            {coverImageUrl && (
              <Image
                src={coverImageUrl}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleRegenerateCover} disabled={isRegenerating}>
              <RefreshCw className="mr-2 h-4 w-4" /> {isRegenerating ? 'Working...' : 'Regenerate'}
            </Button>
            <Button variant="outline" onClick={() => handleAction("Edit Cover")}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" onClick={() => handleAction("Template Change")}>
              <LayoutTemplate className="mr-2 h-4 w-4" /> Template
            </Button>
            <Button variant="outline" onClick={() => handleAction("Color Change")}>
              <Palette className="mr-2 h-4 w-4" /> Colors
            </Button>
          </div>
        </div>

        {/* Right Column: Content and Actions */}
        <div className="md:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
          <div>
            <label htmlFor="product-title" className="text-sm font-medium">Product Title</label>
            <Input
              id="product-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl h-12 mt-1"
            />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Content Preview</h3>
            <Accordion type="multiple" className="w-full border rounded-lg">
              {productResult.content.chapters.map((chapter, index) => (
                 <AccordionItem value={`item-${index+1}`} key={index}>
                    <AccordionTrigger className="px-4 text-left">{chapter.title}</AccordionTrigger>
                    <AccordionContent className="px-4 prose prose-sm dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\\n/g, '<br />') }} />
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Export & Share</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <Button onClick={() => handleAction("PDF Export")}>
                    <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button variant="secondary" onClick={() => handleAction("DOCX Export")}>
                    <FileText className="mr-2 h-4 w-4" /> DOCX
                </Button>
                <Button variant="secondary" onClick={() => handleAction("ZIP Export")}>
                    <FileArchive className="mr-2 h-4 w-4" /> ZIP
                </Button>
                 <Button variant="secondary" onClick={() => handleAction("Saving")}>
                    <Save className="mr-2 h-4 w-4" /> Save
                </Button>
            </div>
             <div className="mt-4">
                 <Button variant="outline" className="w-full" onClick={() => handleAction("Share Link Generation")}>
                    <Share2 className="mr-2 h-4 w-4" /> Generate Share Link
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
