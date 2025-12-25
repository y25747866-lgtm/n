'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
      {user.user_metadata?.full_name && <p className="text-lg text-muted-foreground mt-2">Name: {user.user_metadata.full_name}</p>}
      <p className="text-sm text-muted-foreground mt-1">UID: {user.id}</p>

      <div className="mt-8">
        <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
            <code>
                {JSON.stringify(user, null, 2)}
            </code>
        </pre>
      </div>

      <Button
        onClick={signOut}
        variant="destructive"
        className="mt-6"
      >
        Sign Out
      </Button>
    </div>
  );
}