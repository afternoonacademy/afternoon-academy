import { supabase } from "./supabase.client";
import type { User, Role } from "@repo/types";

/**
 * Ensure a user exists in the public.users table.
 * - If the user exists → returns the row.
 * - If not, inserts a new row with sensible defaults.
 */
export async function ensureUserInDb(
  authUser: { id: string; email?: string; user_metadata?: any },
  roleOverride?: Role
): Promise<User> {
  if (!authUser?.id) {
    throw new Error("❌ ensureUserInDb: No auth user provided");
  }

  // 1️⃣ Check if already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle(); // ✅ won’t throw if row missing

  if (fetchError) {
    console.error("⚠️ ensureUserInDb: fetchError", fetchError.message);
    throw fetchError;
  }

  if (existingUser) {
    console.log("ℹ️ ensureUserInDb: user already exists →", existingUser.email);
    return existingUser as User;
  }

  // 2️⃣ Compute role
  const finalRole: Role =
    roleOverride ??
    (authUser.user_metadata?.role as Role) ??
    "parent"; // default role = parent

  // 3️⃣ Insert new user
  const newUser = {
    id: authUser.id,
    email: authUser.email ?? "",
    name:
      authUser.user_metadata?.name ??
      authUser.email?.split("@")[0] ??
      "New User",
    role: finalRole,
    created_at: new Date().toISOString(), // ✅ always set
  };

  const { data, error: insertError } = await supabase
    .from("users")
    .insert(newUser)
    .select()
    .single();

  if (insertError) {
    console.error("❌ ensureUserInDb: insertError", insertError.message);
    throw insertError;
  }

  console.log("✅ ensureUserInDb: user created →", data.email);
  return data as User;
}
