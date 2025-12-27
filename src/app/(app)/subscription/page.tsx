
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/contexts/subscription-provider";
import { CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const Plan = ({
  title,
  description,
  price,
  pricePeriod,
  features,
  isPopular,
  planId,
  isCurrent,
  checkoutUrl,
}: {
  title: string;
  description: string;
  price: string;
  pricePeriod: string;
  features: string[];
  isPopular?: boolean;
  planId: "monthly" | "annual";
  isCurrent?: boolean;
  checkoutUrl: string;
}) => {
  const { startSubscription, isLoading } = useSubscription();

  return (
    <Card className={cn("glass-card w-full flex flex-col", isPopular && "border-primary/50")}>
      <CardHeader>
        {isPopular && <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-accent-2-start to-accent-2-end text-white border-0">Best Value</Badge>}
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
          asChild
          className="w-full"
          size="lg"
          disabled={isLoading || isCurrent}
        >
          <Link href={checkoutUrl} target="_blank" onClick={() => startSubscription(planId)}>
            {isCurrent ? "Current Plan" : "Subscribe with Whop"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function SubscriptionPage() {
    const { subscription } = useSubscription();
    const { toast } = useToast();
    const router = useRouter();

    const handleGatAccess = () => {
        if (subscription.status === 'active') {
            router.push('/dashboard');
        } else {
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "Please subscribe to access.",
            });
        }
    };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sylhet Plan</h1>
        <p className="text-muted-foreground">Choose the plan that's right for your empire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Plan
            title="Monthly"
            description="Perfect for getting started and testing the waters."
            price="60"
            pricePeriod="month"
            features={["50 credits/month", "50 cover regenerations", "Full feature access", "Cancel anytime"]}
            planId="monthly"
            isCurrent={subscription.planId === 'monthly'}
            checkoutUrl="https://whop.com/checkout/plan_cGgxUSfDmR2xF"
        />
        <Plan
            title="Yearly"
            description="Best value for serious creators and business owners."
            price="600"
            pricePeriod="year"
            features={["600 credits/year", "Unlimited regenerations", "Priority support", "Early access to new features"]}
            isPopular
            planId="annual"
            isCurrent={subscription.planId === 'annual'}
            checkoutUrl="https://whop.com/checkout/plan_xNlBWUTysLURE"
        />
      </div>

      <div className="text-center pt-8">
          <Button size="lg" onClick={handleGatAccess}>
              Gat
          </Button>
      </div>
    </div>
  );
}
