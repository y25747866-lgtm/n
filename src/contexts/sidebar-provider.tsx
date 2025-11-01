
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

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
  const isMobileQuery = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMobile = isClient ? isMobileQuery : false;
  const isDesktop = isClient ? !isMobileQuery : true;

  const [isOpen, setIsOpen] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);

  useEffect(() => {
    if (isClient) {
      setIsOpen(isDesktop);
    }
  }, [isDesktop, isClient]);

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
