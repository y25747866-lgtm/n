
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zprgfzoxlgaxbnnjvvir.supabase.co";
const supabaseAnonKey = "sb_publishable_2UfSEKfj3hudWMErSusdsA_1pc7pxpi";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or anon key are not defined.");
}

// Initialize the Supabase client with session persistence options.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});
