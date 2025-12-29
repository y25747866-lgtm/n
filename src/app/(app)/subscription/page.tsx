
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const SubscriptionButton = ({ planId, checkoutUrl, title }: { planId: string; checkoutUrl: string; title: string }) => {
    const handleCheckout = () => {
        const referrer = localStorage.getItem("referrer") || 'none';
        const userId = localStorage.getItem("supabase_user_id");

        if (!userId) {
            alert("Could not identify user. Please sign in again.");
            return;
        }

        const url = new URL(checkoutUrl);
        url.searchParams.set("metadata[supabase_user_id]", userId);
        url.searchParams.set("metadata[referrer]", referrer);

        window.location.href = url.toString();
    };

    return (
        <Button onClick={handleCheckout} className="w-full" size="lg">
            {title}
        </Button>
    );
};


export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/auth/sign-in');
      } else {
        setUser(data.session.user);
        // Store user ID in localStorage for the checkout buttons
        localStorage.setItem("supabase_user_id", data.session.user.id);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  const Plan = ({
      title,
      description,
      price,
      pricePeriod,
      features,
      isPopular,
      planId,
      checkoutUrl,
  }: {
      title: string;
      description: string;
      price: string;
      pricePeriod: string;
      features: string[];
      isPopular?: boolean;
      planId: 'monthly' | 'yearly';
      checkoutUrl: string;
  }) => {
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
                 <SubscriptionButton 
                    planId={planId} 
                    checkoutUrl={checkoutUrl} 
                    title="Get Started" 
                 />
            </CardFooter>
        </Card>
      );
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="space-y-8 max-w-4xl w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-center">Choose Your Plan</h1>
            <p className="text-muted-foreground text-center">
              Welcome, {user.email}. Select a plan to unlock the power of NexoraOS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Plan
                title="Monthly"
                description="Perfect for getting started and testing the waters."
                price="60"
                pricePeriod="month"
                features={["50 credits/month", "50 cover regenerations", "Full feature access", "Cancel anytime"]}
                planId="monthly"
                checkoutUrl="https://whop.com/checkout/plan_cGgxUSfDmR2xF"
            />
            <Plan
                title="Yearly"
                description="Best value for serious creators and business owners."
                price="600"
                pricePeriod="year"
                features={["600 credits/year", "Unlimited regenerations", "Priority support", "Early access to new features"]}
                isPopular
                planId="yearly"
                checkoutUrl="https://whop.com/checkout/plan_xNlBWUTysLURE"
            />
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>
              After subscribing on Whop, your access will be granted automatically. Please refresh this page or{" "}
              <Link href="/dashboard" className="underline hover:text-primary">
                  proceed to the dashboard
              </Link>.
            </p>
          </div>
        </div>
    </div>
  );
}
