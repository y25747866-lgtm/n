
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  isDesktop: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  // On desktop, default to open. On mobile, default to closed.
  const [isOpen, setIsOpen] = useState(true);

  // When switching between mobile/desktop, adjust sidebar state
  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };
  
  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleSidebar,
      isMobile,
      isDesktop
    }),
    [isOpen, isMobile, isDesktop]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
