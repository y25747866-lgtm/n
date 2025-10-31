
'use client';

import AppSidebar from '@/components/boss-os/app-sidebar';
import Header from '@/components/boss-os/header';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/lib/utils';
import React from 'react';
import { usePathname } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase/client-provider';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isDesktop, isNavVisible, setIsNavVisible } = useSidebar();
  const pathname = usePathname();

  // On initial load of any page other than dashboard, ensure nav is visible.
  React.useEffect(() => {
    if (pathname !== '/dashboard') {
      setIsNavVisible(true);
    }
  }, [pathname, setIsNavVisible]);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isNavVisible && isDesktop && (isOpen ? "ml-72" : "ml-20")
        )}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  // We wrap the content in SidebarProvider here, so both AppSidebar and AppContent can use it.
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
