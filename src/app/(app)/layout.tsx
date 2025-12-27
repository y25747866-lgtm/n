
'use client';

import AppSidebar from '@/components/boss-os/app-sidebar';
import Header from '@/components/boss-os/header';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-provider';
import { SubscriptionProvider, useSubscription } from '@/contexts/subscription-provider';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isDesktop, isNavVisible } = useSidebar();
  const { subscription } = useSubscription();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/auth');
  const isSubscriptionPage = pathname.startsWith('/subscription');

  useEffect(() => {
    // 1. Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      if (!session && !isAuthPage && pathname !== '/') {
        router.push('/auth/sign-in');
      } else if (session && subscription.status !== 'active' && !isSubscriptionPage) {
        // If logged in but not subscribed, force to subscription page
        router.push('/subscription');
      }
    });

    // 3. Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession && (isAuthPage || pathname === '/')) {
            // User just logged in.
            if (subscription.status !== 'active') {
                router.push('/subscription');
            } else {
                router.push('/dashboard');
            }
        } else if (!currentSession && !isAuthPage && pathname !== '/') {
            router.push('/auth/sign-in');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router, isAuthPage, subscription.status, isSubscriptionPage]);

  // Show landing page and auth pages without the main app layout
  if (pathname === '/' || isAuthPage) {
    return <>{children}</>;
  }
  
  if (loading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  // If loading is finished and still no session, the redirect is in flight.
  if (!session) {
      return null;
  }
  
  // If user is logged in but not subscribed, and not on the subscription page,
  // the redirect is in flight.
  if (session && subscription.status !== 'active' && !isSubscriptionPage) {
      return null;
  }


  // Render the main app layout for authenticated, subscribed users
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
