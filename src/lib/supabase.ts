import { createClient } from "@supabase/supabase-js";

// Use the specific credentials provided by the user.
const supabaseUrl = "https://zprgfzoxlgaxbnnjvvir.supabase.co";
const supabaseAnonKey = "sb_publishable_2UfSEKfj3hudWMErSusdsA_1pc7pxpi";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or anon key are not defined.");
}

// Initialize the Supabase client.
// The auth options are set to their defaults but are explicit here for clarity.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});
