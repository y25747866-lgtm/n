
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import React, { createContext, useContext, useState, useMemo } from "react";

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  isDesktop: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

  const toggleSidebar = () => {
    setOpen(prev => !prev);
  };
  
  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar,
      isMobile,
      isDesktop
    }),
    [open, isMobile, isDesktop]
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

