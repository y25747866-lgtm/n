import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://kyrcvivvtrkfsffzfuex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cmN2aXZ2dHJrZnNmZnpmdWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MDUyNTYsImV4cCI6MjAzNzQ4MTI1Nn0.sb_publishable_-j7izUOrkafkihJrtT1d6A_kqze4jZr';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or anon key are not defined");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
