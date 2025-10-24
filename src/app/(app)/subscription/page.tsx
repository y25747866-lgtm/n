"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/contexts/subscription-provider";
import { CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Plan = ({
  title,
  description,
  price,
  pricePeriod,
  features,
  isPopular,
  planId,
  isCurrent,
}: {
  title: string;
  description: string;
  price: string;
  pricePeriod: string;
  features: string[];
  isPopular?: boolean;
  planId: "monthly" | "annual";
  isCurrent?: boolean;
}) => {
  const { startSubscription, isLoading, subscription } = useSubscription();

  return (
    <Card className={cn("glass-card w-full flex flex-col", isPopular && "border-primary/50")}>
      <CardHeader>
        {isPopular && <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-accent-2-start to-accent-2-end text-white border-0">2 Months Free</Badge>}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div>
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/{pricePeriod}</span>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={() => startSubscription(planId)}
          disabled={isLoading || isCurrent}
        >
          {isLoading && subscription.planId === planId ? "Subscribing..." : isCurrent ? "Current Plan" : "Subscribe with Lemon Squeezy"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function SubscriptionPage() {
    const { startTrial, isLoading, subscription } = useSubscription();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose the plan that's right for your empire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {subscription.status === 'unsubscribed' && (
            <Card className="glass-card w-full flex flex-col items-center text-center p-8">
                <Star className="h-10 w-10 text-yellow-400 mb-4"/>
                <h3 className="text-xl font-bold">Not sure yet?</h3>
                <p className="text-muted-foreground mt-2 mb-6">Get a taste of Boss OS with a free trial. No commitment required.</p>
                <Button 
                    size="lg" 
                    className="w-full"
                    onClick={startTrial}
                    disabled={isLoading}
                >
                    {isLoading && subscription.status === 'unsubscribed' ? "Starting..." : "Start 7-day Trial"}
                </Button>
                <p className="text-xs text-muted-foreground mt-4">3 generations included</p>
            </Card>
        )}
        
        <div className={cn("flex flex-col gap-8", subscription.status === 'unsubscribed' && 'md:col-span-2')}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Plan
                title="Monthly"
                description="Perfect for getting started and testing the waters."
                price="60"
                pricePeriod="month"
                features={["50 credits/month", "50 cover regenerations", "Full feature access", "Cancel anytime"]}
                planId="monthly"
                isCurrent={subscription.planId === 'monthly'}
                />
                <Plan
                title="Annual"
                description="Best value for serious creators and business owners."
                price="600"
                pricePeriod="year"
                features={["600 credits/year", "Unlimited regenerations", "Priority support", "Early access to new features"]}
                isPopular
                planId="annual"
                isCurrent={subscription.planId === 'annual'}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
