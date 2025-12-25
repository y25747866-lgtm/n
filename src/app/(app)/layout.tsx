
'use client';

import AppSidebar from '@/components/boss-os/app-sidebar';
import Header from '@/components/boss-os/header';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-provider';
import { SubscriptionProvider } from '@/contexts/subscription-provider';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Fetch the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      // 2. Redirect if not logged in and not on the landing page
      if (!session && pathname !== '/') {
        router.push('/');
      }
    });

    // 3. Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
        // 4. Redirect on sign out or if the session becomes null
        if (!currentSession && pathname !== '/') {
            router.push('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // The landing page should not show the main app layout and can be shown while loading
  if (pathname === '/') {
    return <>{children}</>;
  }
  
  // Show a full-page loader while the session is being checked
  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  // If still no session after loading, it means the redirect is in progress.
  // Rendering null avoids a flash of the old layout.
  if (!session) {
      return null;
  }

  // Once authenticated and loading is complete, render the main app layout.
  return (
    <div className="flex min-h-screen bg-background">
      {isNavVisible && <AppSidebar session={session} />}
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
      <SubscriptionProvider>
        <SidebarProvider>
          <AppContent>{children}</AppContent>
        </SidebarProvider>
      </SubscriptionProvider>
  );
}
