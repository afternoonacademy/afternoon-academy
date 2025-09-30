// packages/lib/ensureAuthUser.ts
import { supabase } from "./supabase.client";
import { ensureUserInDb } from "./ensureUserInDb";
import type { User, Role } from "@repo/types";

/**
 * Ensure a user exists in both auth.users and public.users.
 */
export async function ensureAuthUser(
  email: string,
  name: string,
  role: Role,
  password = process.env.SEED_DEFAULT_PASSWORD || "Passw0rd!seed123"
): Promise<User> {
  // 1️⃣ Try to create the auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  let authUser = data?.user;

  // 2️⃣ If already exists, fetch it
  if (!authUser && error) {
    if (error.code === "email_exists" || error.status === 422) {
      const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;
      const found = list.users.find((u) => u.email === email);
      if (!found) throw new Error(`Auth user ${email} exists but not found`);
      authUser = found;
    } else {
      throw error;
    }
  }

  if (!authUser) {
    throw new Error(`❌ Failed to ensure auth user for ${email}`);
  }

  // 3️⃣ Ensure they exist in public.users
  const userRow = await ensureUserInDb(authUser, role);
  return userRow;
}
