
'use client';

import AppSidebar from '@/components/boss-os/app-sidebar';
import Header from '@/components/boss-os/header';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-provider';
import { SubscriptionProvider } from '@/contexts/subscription-provider';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
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

  const isAuthPage = pathname.startsWith('/auth');

  useEffect(() => {
    // 1. Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      // 2. Redirect if no session and not on an auth page
      if (!session && !isAuthPage && pathname !== '/') {
        router.push('/auth/sign-in');
      }
    });

    // 3. Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        // Redirect on sign-in (if on an auth page) or sign-out
        if (currentSession && isAuthPage) {
            router.push('/dashboard');
        }
        if (!currentSession && !isAuthPage && pathname !== '/') {
            router.push('/auth/sign-in');
        }
      }
    );

    // 4. Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router, isAuthPage]);

  // Show landing page and auth pages without the main app layout
  if (pathname === '/' || isAuthPage) {
    return <>{children}</>;
  }
  
  // Show a loading screen while session is being checked
  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  // If loading is finished and still no session, the redirect is in flight.
  // Render nothing to avoid a flash of the dashboard.
  if (!session) {
      return null;
  }

  // Render the main app layout for authenticated users
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
