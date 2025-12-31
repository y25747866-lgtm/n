
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    if (user) {
        // Storing the user ID in a cookie or local storage after authentication
        // can be handled client-side on the page the user is redirected to.
        // For simplicity, we just redirect.
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/subscription`);
}
