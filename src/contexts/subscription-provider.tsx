"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export type PlanStatus = "unsubscribed" | "trial" | "active";

type SubscriptionState = {
  status: PlanStatus;
  credits: number;
  planId: "monthly" | "annual" | null;
  renewalDate: Date | null;
};

type SubscriptionContextType = {
  subscription: SubscriptionState;
  startTrial: () => void;
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

  const startTrial = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + 7);
      setSubscription({
        status: "trial",
        credits: 3,
        planId: null,
        renewalDate,
      });
      setIsLoading(false);
      toast({
        title: "Trial Started!",
        description: "You now have 3 generation credits for 7 days.",
      });
    }, 1500);
  }, [toast]);

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
        renewalDate,
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
      startTrial,
      startSubscription,
      isLoading,
    }),
    [subscription, isLoading, startTrial, startSubscription]
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
