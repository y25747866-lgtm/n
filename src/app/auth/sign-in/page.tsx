'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/boss-os/auth-card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

const SignInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleMagicLinkSignIn = async (values: z.infer<typeof SignInSchema>) => {
    setIsLoading(true);
    const { email } = values;

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
      router.push('/auth/check-email');
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleMagicLinkSignIn)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Magic Link
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
