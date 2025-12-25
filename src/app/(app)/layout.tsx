
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
