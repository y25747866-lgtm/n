
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Book, LayoutTemplate, Loader2, Search } from "lucide-react";
import Image from "next/image";

const templates = [
  {
    title: "Minimalist Portfolio",
    description: "A clean and modern portfolio template for creatives.",
    thumbnail: "/placeholder-template-1.png",
  },
  {
    title: "SaaS Landing Page",
    description: "High-converting landing page for software products.",
    thumbnail: "/placeholder-template-2.png",
  },
  {
    title: "Digital Product Storefront",
    description: "A sleek storefront to sell your digital goods.",
    thumbnail: "/placeholder-template-3.png",
  },
   {
    title: "Agency Website",
    description: "Professional template for digital agencies and freelancers.",
    thumbnail: "/placeholder-template-4.png",
  },
  {
    title: "Blog & Newsletter",
    description: "Content-focused template for writers and creators.",
    thumbnail: "/placeholder-template-5.png",
  },
  {
    title: "Personal Website",
    description: "A stylish personal site to build your brand.",
    thumbnail: "/placeholder-template-6.png",
  },
];

const filters = ['Landing Pages', 'Portfolios', 'Product Pages', 'Blogs'];

function TemplateSearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutTemplate />
            Template Search
        </h1>
        <p className="text-muted-foreground">Browse web templates for landing pages, products, and portfolios.</p>
      </div>

       <div className="flex flex-col space-y-4">
        <div className="relative">
          <Input
            placeholder="Search for a template..."
            className="h-12 pr-28"
          />
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant='outline'
              className="rounded-full"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
            <Card key={index} className="glass-card flex flex-col">
              <CardHeader>
                <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                    <Image src={`https://picsum.photos/seed/${index+20}/600/400`} alt={template.title} fill className="object-cover" data-ai-hint="website template" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  View Template <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}


export default function TrendingIdeasPage() {
  // This page is now repurposed as the Template Search page
  return <TemplateSearchPage />;
}
