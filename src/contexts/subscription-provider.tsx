
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
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionState>({
    status: "unsubscribed",
    credits: 0,
    planId: null,
    renewalDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if(session?.user?.id) {
            setUserId(session.user.id);
            // In a real app, you would fetch subscription status from your DB here
            // For now, we'll keep it as a local state simulation
        }
    });

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
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [])


  const startSubscription = useCallback((planId: "monthly" | "annual") => {
    setIsLoading(true);
    // This is a simulation. In a real app, a webhook from Whop would trigger
    // an update in your database, and this client would refetch the state.
    // For now, we simulate the successful "purchase" after a delay.
    setTimeout(() => {
      const renewalDate = new Date();
      if (planId === 'monthly') {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }
      const newSubscriptionState = {
        status: "active" as PlanStatus,
        credits: planId === 'monthly' ? 50 : 600,
        planId,
        renewalDate: renewalDate.toISOString(),
      };
      setSubscription(newSubscriptionState);

      // Here you would also save this to your database
      // e.g. await supabase.from('user_subscriptions').upsert({ user_id: userId, ... })
      
      setIsLoading(false);
      toast({
        title: "Welcome aboard!",
        description: `Your ${planId} plan is now active. Click 'Gat' to continue.`,
      });
    }, 500); // Short delay to simulate the user being redirected to Whop and back
  }, [toast, userId]);

  const value = useMemo(
    () => ({
      subscription,
      startSubscription,
      isLoading,
    }),
    [subscription, isLoading, startSubscription]
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
