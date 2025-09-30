import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 🚨 Fallback: use service role if present & not running in browser
// This allows scripts/tests to bypass RLS automatically.
const isServer = typeof window === "undefined";
const keyToUse = isServer && serviceKey ? serviceKey : anonKey;

if (!supabaseUrl || !keyToUse) {
  throw new Error("❌ Missing Supabase environment variables");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, keyToUse);

console.log(
  `🟢 Supabase client initialised with ${
    keyToUse === serviceKey ? "SERVICE ROLE" : "ANON"
  } key`
);
