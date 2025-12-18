
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Palette, Rocket, Sparkles, Wand2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: Wand2,
    title: "AI Content Factory",
    description: "Generate complete ebooks, courses, and lead magnets from a single topic idea. Your entire digital product, written in minutes.",
  },
  {
    icon: Palette,
    title: "Instant Cover Design",
    description: "Create stunning, professional cover art that matches your content's topic and style. No design skills required.",
  },
  {
    icon: Sparkles,
    title: "Trend Discovery",
    description: "Tap into real-time market data to find trending topics and niches with high demand, ensuring your products sell.",
  },
  {
    icon: Zap,
    title: "Automated Workflow",
    description: "From idea to downloadable product, Boss OS automates the entire creation process, saving you hundreds of hours.",
  },
];

const faqs = [
  {
    question: "What is Boss OS?",
    answer: "Boss OS is an all-in-one platform that uses AI to automate the creation of digital products like ebooks, online courses, and lead magnets. It handles everything from content writing and cover design to identifying trending topics, allowing you to launch products faster.",
  },
  {
    question: "Who is this for?",
    answer: "Boss OS is designed for entrepreneurs, creators, marketers, and anyone looking to build a digital product empire. Whether you're a seasoned pro or just starting, our platform simplifies the entire process.",
  },
  {
    question: "How do the credits work?",
    answer: "Each full product generation (e.g., a complete ebook and cover) consumes credits from your plan. This allows us to provide high-quality AI generation. You can purchase more credits or upgrade your plan as needed.",
  },
  {
    question: "Can I use my own content?",
    answer: "Currently, Boss OS is focused on generating new content from your ideas. We are exploring features that will allow you to import and enhance your existing content in the future.",
  },
];


export default function DashboardPage() {
    const founderImage = PlaceHolderImages.find(p => p.id === 'founder-yesh');
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="py-10 text-center sm:py-16">
        <h1 className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-accent-gradient-1">
          The All-In-One Digital Product OS
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Stop juggling tools. Boss OS is your AI-powered command center to discover, create, and launch digital products in record time.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild className="h-12 px-8 text-lg">
              <Link href="/generate">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Creating Now
              </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-8 text-lg">
              <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* What is Boss OS */}
      <section id="about" className="py-8 sm:py-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
              <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What is Boss OS?</h2>
                  <p className="text-muted-foreground">
                      Boss OS is a complete operating system for modern digital creators. It replaces the chaos of multiple apps with a single, intelligent platform.
                  </p>
                  <p className="text-muted-foreground">
                      We integrate AI-powered trend analysis, content generation, and design tools into a seamless workflow, so you can focus on building your empire, not fighting with software. Go from a simple idea to a market-ready digital product in minutes.
                  </p>
              </div>
               <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhaSUyMGRhc2hib2FyZHxlbnwwfHx8fDE3NjE5NTc0MjF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Boss OS Dashboard"
                      fill
                      className="object-cover"
                      data-ai-hint="ai dashboard"
                  />
              </div>
          </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-8 sm:py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Your Creative Superpower</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything you need to turn ideas into income streams.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="glass-card flex flex-col p-6">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Founder Section */}
      <section className="py-8 sm:py-12">
          <Card className="glass-card">
              <CardContent className="p-8 md:p-12">
                  <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
                       <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-primary/50">
                          {founderImage && <Image 
                              src={founderImage.imageUrl} 
                              alt="Yesh Malik"
                              fill
                              className="object-cover"
                              data-ai-hint={founderImage.imageHint}
                          />}
                      </div>
                      <div className="space-y-4 md:col-span-2">
                           <p className="text-lg text-muted-foreground">
                              "I built Boss OS to scratch my own itch. I was tired of spending weeks on tasks that AI could do in minutes. My goal is to empower 10,000 creators to launch their own digital product empires. This is the tool I wish I had when I started."
                          </p>
                          <div>
                              <p className="font-semibold">Yesh Malik</p>
                              <p className="text-sm text-muted-foreground">Founder of Boss OS</p>
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
      </section>


      {/* Get Started Section */}
      <section className="py-8 text-center sm:py-12">
        <Rocket className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Launch Your Empire?</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Stop waiting and start creating. Your first digital product is just minutes away.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild className="h-12 px-8 text-lg">
               <Link href="/generate">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Have questions? We've got answers.
            </p>
          </div>
          <Accordion type="single" collapsible className="mt-12 w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
