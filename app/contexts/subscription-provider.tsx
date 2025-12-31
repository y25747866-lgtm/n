
"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export type PlanStatus = "unsubscribed" | "active";

type SubscriptionState = {
  status: PlanStatus;
  credits: number;
  planId: "monthly" | "annual" | null;
  renewalDate: string | null;
};

type SubscriptionContextType = {
  subscription: SubscriptionState;
  startSubscription: (planId: "monthly" | "annual") => void;
  isLoading: boolean;
  isSubscriptionLoading: boolean; // Renamed for clarity
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// This is a placeholder for where you'd store your subscription data in a real app.
// For this simulation, we'll use a local object. In a real app, this would be a Supabase table.
const FAKE_DB = {
    subscription: null as SubscriptionState | null
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionState>({
    status: "unsubscribed",
    credits: 0,
    planId: null,
    renewalDate: null,
  });
  const [isLoading, setIsLoading] = useState(false); // For checkout process
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true); // For initial fetch
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once on mount to get the initial auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUserId = session?.user?.id ?? null;
        setUserId(newUserId);
        if (!newUserId) {
             // Reset on logout
             setSubscription({
                status: "unsubscribed",
                credits: 0,
                planId: null,
                renewalDate: null,
             });
             FAKE_DB.subscription = null; // Clear fake DB on logout
             setIsSubscriptionLoading(false);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // This effect fetches the subscription status when the user ID is known
    if (userId) {
        setIsSubscriptionLoading(true);
        // In a real app, you would fetch subscription status from your DB
        // const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
        // For now, we use our fake in-memory DB
        setTimeout(() => { // Simulate network delay
            if (FAKE_DB.subscription) {
                setSubscription(FAKE_DB.subscription);
            } else {
                setSubscription({
                    status: "unsubscribed",
                    credits: 0,
                    planId: null,
                    renewalDate: null,
                });
            }
            setIsSubscriptionLoading(false);
        }, 500);
    } else {
        // No user, so loading is done and they are unsubscribed.
        setIsSubscriptionLoading(false);
    }
  }, [userId]);


  const startSubscription = useCallback((planId: "monthly" | "annual") => {
    setIsLoading(true);
    // This is a simulation. In a real app, a webhook from Whop would update
    // your database. This function simulates the user returning from a successful checkout.
    setTimeout(() => {
      const renewalDate = new Date();
      if (planId === 'monthly') {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }
      
      const newSubscriptionState: SubscriptionState = {
        status: "active",
        credits: planId === 'monthly' ? 50 : 600,
        planId,
        renewalDate: renewalDate.toISOString(),
      };

      // Save to our fake DB and update the state
      FAKE_DB.subscription = newSubscriptionState;
      setSubscription(newSubscriptionState);
      
      setIsLoading(false);
      toast({
        title: "Welcome aboard!",
        description: `Your ${planId} plan is now active. Click 'Gat' to continue.`,
      });
    }, 1000); // Simulate user being redirected to Whop and back
  }, [toast]);

  const value = useMemo(
    () => ({
      subscription,
      startSubscription,
      isLoading,
      isSubscriptionLoading,
    }),
    [subscription, isLoading, startSubscription, isSubscriptionLoading]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
