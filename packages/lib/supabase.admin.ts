import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("❌ Missing Supabase service role env vars");
}

// Admin client bypasses RLS – only safe to use in backend
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
