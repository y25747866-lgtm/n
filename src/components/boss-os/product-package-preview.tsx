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
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Separator } from "../ui/separator";

type GenerationParams = {
  topic: string;
};

export function ProductPackagePreview({ generationParams }: { generationParams: GenerationParams }) {
  const [title, setTitle] = useState(generationParams.topic);
  const coverImage = PlaceHolderImages.find((p) => p.id === "cover-photo");
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
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden border">
            {coverImage && (
              <Image
                src={coverImage.imageUrl}
                alt={title}
                fill
                className="object-cover"
                data-ai-hint={coverImage.imageHint}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleAction("Regeneration")}>
              <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
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
            <Accordion type="single" collapsible className="w-full border rounded-lg">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-4">Chapter 1: Introduction</AccordionTrigger>
                <AccordionContent className="px-4">
                  Welcome to the world of {generationParams.topic}. This book will guide you through the essentials, providing you with the knowledge and skills to master this exciting field.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-4">Chapter 2: The Core Principles</AccordionTrigger>
                <AccordionContent className="px-4">
                  Here we dive deep into the fundamental concepts that form the backbone of {generationParams.topic}.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="px-4">Chapter 3: Advanced Techniques</AccordionTrigger>
                <AccordionContent className="px-4">
                  Take your skills to the next level with these advanced strategies and expert tips.
                </AccordionContent>
              </AccordionItem>
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
