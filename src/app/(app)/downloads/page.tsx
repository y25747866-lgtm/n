
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Book } from "lucide-react";

const trendingProducts = [
  {
    title: "AI-Powered Ebook Generator",
    description: "Create ebooks on any topic in minutes.",
  },
  {
    title: "Niche-Specific Notion Templates",
    description: "Organize your life and work with specialized templates.",
  },
  {
    title: "Personalized Digital Planners",
    description: "Custom planners for goals, habits, and productivity.",
  },
   {
    title: "Micro-SaaS Boilerplates",
    description: "Kickstart your next software project instantly.",
  },
  {
    title: "Short-Form Video Course",
    description: "Master TikTok and Reels to grow your audience.",
  },
  {
    title: "Customizable Canva Templates",
    description: "Stunning visuals for social media and marketing.",
  },
];

function ProductSearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Book />
          Digital Product Ideas
        </h1>
        <p className="text-muted-foreground">Browse trending topics for e-books, courses, and guides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingProducts.map((product, index) => (
            <Card key={index} className="glass-card flex flex-col">
              <CardContent className="pt-6 flex-1">
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">{product.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Explore Topic <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}


export default function DownloadsPage() {
  // This page is now repurposed as the Digital Product Search page
  return <ProductSearchPage />;
}
