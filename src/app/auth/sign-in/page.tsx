
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/boss-os/auth-card';
import Link from 'next/link';

export default function SignInPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // This URL must be added to your Supabase Auth settings
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-in failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Check your email',
        description: 'A magic link has been sent to your email address.',
      });
      // Don't redirect here, just show the message
    }
  };

  return (
    <AuthCard
      title="Welcome to NexoraOS"
      description="Enter your email below to sign in or create an account."
      footerContent={
        <p className="text-muted-foreground text-sm">
          By signing in, you agree to our{" "}
          <Link href="#" className="underline hover:text-primary">
            Terms of Service
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full p-2 border mb-4 h-12 text-base"
        />
        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Magic Link'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
