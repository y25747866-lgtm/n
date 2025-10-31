
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Book, LayoutTemplate, Loader2, Search } from "lucide-react";
import Image from "next/image";

const trendingProducts = [
  {
    title: "AI-Powered Ebook Generator",
    description: "Create ebooks on any topic in minutes.",
    thumbnail: "/placeholder-cover-1.png",
  },
  {
    title: "Niche-Specific Notion Templates",
    description: "Organize your life and work with specialized templates.",
    thumbnail: "/placeholder-cover-2.png",
  },
  {
    title: "Personalized Digital Planners",
    description: "Custom planners for goals, habits, and productivity.",
    thumbnail: "/placeholder-cover-3.png",
  },
   {
    title: "Micro-SaaS Boilerplates",
    description: "Kickstart your next software project instantly.",
    thumbnail: "/placeholder-cover-4.png",
  },
  {
    title: "Short-Form Video Course",
    description: "Master TikTok and Reels to grow your audience.",
    thumbnail: "/placeholder-cover-5.png",
  },
  {
    title: "Customizable Canva Templates",
    description: "Stunning visuals for social media and marketing.",
    thumbnail: "/placeholder-cover-6.png",
  },
];

const filters = ['E-books', 'Courses', 'Guides', 'Templates', 'AI Tools'];

function ProductSearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Book />
          Digital Product Search
        </h1>
        <p className="text-muted-foreground">Discover trending e-books, courses, or guides.</p>
      </div>

       <div className="flex flex-col space-y-4">
        <div className="relative">
          <Input
            placeholder="Search for a digital product..."
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
        {trendingProducts.map((product, index) => (
            <Card key={index} className="glass-card flex flex-col">
              <CardHeader className="p-4">
                <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                    <Image src={`https://picsum.photos/seed/${index+10}/600/400`} alt={product.title} fill className="object-cover" data-ai-hint="digital product" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">{product.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  View Product <ArrowRight className="ml-2 h-4 w-4" />
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
