
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  isDesktop: boolean;
  isNavVisible: boolean;
  setIsNavVisible: (visible: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  const pathname = usePathname();

  // On desktop, sidebar is open. On mobile, it's closed.
  const [isOpen, setIsOpen] = useState(isDesktop);
  
  // Nav is hidden by default only on the dashboard page.
  const [isNavVisible, setIsNavVisible] = useState(pathname !== '/dashboard');

  // When switching between mobile/desktop, adjust sidebar state
  useEffect(() => {
    if (isNavVisible) {
      setIsOpen(isDesktop);
    } else {
      setIsOpen(false);
    }
  }, [isDesktop, isNavVisible]);

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };
  
  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleSidebar,
      isMobile,
      isDesktop,
      isNavVisible,
      setIsNavVisible
    }),
    [isOpen, isMobile, isDesktop, isNavVisible]
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
