
"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

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

  const startSubscription = useCallback((planId: "monthly" | "annual") => {
    setIsLoading(true);
    setTimeout(() => {
      const renewalDate = new Date();
      if (planId === 'monthly') {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }
      setSubscription({
        status: "active",
        credits: planId === 'monthly' ? 50 : 600,
        planId,
        renewalDate: renewalDate.toISOString(),
      });
      setIsLoading(false);
      toast({
        title: "Subscription Successful!",
        description: `Your ${planId} plan is now active.`,
      });
    }, 1500);
  }, [toast]);

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
