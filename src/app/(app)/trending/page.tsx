"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const trendingIdeas = [
  {
    title: "AI-Powered Productivity Planner",
    rationale: "The intersection of AI and personal productivity is a booming market with high demand.",
    trendScore: 95,
  },
  {
    title: "Beginner's Guide to DeFi",
    rationale: "As cryptocurrency goes mainstream, educational content for beginners is highly sought after.",
    trendScore: 92,
  },
  {
    title: "Sustainable Living Checklist",
    rationale: "Eco-consciousness is a major global trend, driving interest in practical guides for sustainable habits.",
    trendScore: 88,
  },
  {
    title: "The 30-Day Mindfulness Journal",
    rationale: "Mental wellness and mindfulness continue to be a top priority for a broad audience.",
    trendScore: 85,
  },
  {
    title: "Canva Templates for Solopreneurs",
    rationale: "The creator economy is expanding, and time-saving design assets are always in demand.",
    trendScore: 82,
  },
  {
    title: "Meal Prep Course for Busy Professionals",
    rationale: "Health, wellness, and convenience are powerful motivators for this target demographic.",
    trendScore: 78,
  },
];

const filters = ["Amazon PLR", "Etsy Digital", "Udemy", "Google Trends", "Future Prediction"];

export default function TrendingIdeasPage() {
  const router = useRouter();

  const handleUseTrend = (topic: string) => {
    router.push(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trending Ideas</h1>
        <p className="text-muted-foreground">Discover your next bestselling digital product.</p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search trends..." className="pl-10 h-12" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <Button key={filter} variant="outline" className="rounded-full">
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingIdeas.map((idea, index) => (
          <Card key={index} className="glass-card flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle>{idea.title}</CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BarChart className="h-3 w-3" />
                    {idea.trendScore}
                  </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground text-sm">{idea.rationale}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleUseTrend(idea.title)}>
                Use This Trend <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
