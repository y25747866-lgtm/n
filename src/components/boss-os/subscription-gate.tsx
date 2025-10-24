"use client";

import { useSubscription } from "@/contexts/subscription-provider";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function SubscriptionGate() {
  const { startTrial, isLoading } = useSubscription();

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Sparkles className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold">Start generating with Boss OS</h3>
            <p className="text-muted-foreground mt-1">
              Subscribe or start a free trial to unlock AI product generation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            size="lg"
            onClick={startTrial}
            disabled={isLoading}
            className="bg-gradient-to-r from-accent-2-start to-accent-2-end text-white"
          >
            {isLoading ? "Starting..." : "Start 7-day Free Trial"}
          </Button>
          <Link href="/subscription">
            <Button size="lg" variant="outline">
              Subscribe
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
