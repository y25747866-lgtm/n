
'use client';

import AppSidebar from '@/components/boss-os/app-sidebar';
import Header from '@/components/boss-os/header';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-provider';
import { SubscriptionProvider } from '@/contexts/subscription-provider';
import { cn } from '@/lib/utils';
import React from 'react';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';

function AppSkeleton() {
  const { isOpen, isDesktop, isNavVisible } = useSidebar();
  return (
    <div className="flex min-h-screen bg-background">
      {isNavVisible && (
        <div className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isOpen ? "w-72" : "w-20"
        )}>
          <div className="flex h-14 items-center border-b px-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 p-2 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-auto border-t p-4">
             <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          (isNavVisible && isDesktop && (isOpen ? "ml-72" : "ml-20"))
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-8 w-1/2" />
            </div>
            <div className="mt-8">
                <Skeleton className="w-full h-64" />
            </div>
        </main>
      </div>
    </div>
  );
}


function AppContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isDesktop, isNavVisible } = useSidebar();
  const { isUserLoading } = useUser();
  const pathname = usePathname();

  // The landing page should not show the main app layout
  if (pathname === '/landing') {
    return <>{children}</>;
  }

  if (isUserLoading) {
    return <AppSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {isNavVisible && <AppSidebar />}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          (isNavVisible && isDesktop && (isOpen ? "ml-72" : "ml-20"))
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
  return (
    <FirebaseClientProvider>
      <SubscriptionProvider>
        <SidebarProvider>
          <AppContent>{children}</AppContent>
        </SidebarProvider>
      </SubscriptionProvider>
    </FirebaseClientProvider>
  );
}
