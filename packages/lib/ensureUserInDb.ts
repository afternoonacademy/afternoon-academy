import { supabase } from "./supabase.client";

export async function ensureUserInDb(authUser: { id: string; email?: string; user_metadata?: any }, role?: "admin" | "parent" | "student" | "teacher") {
  if (!authUser?.id) {
    throw new Error("❌ No auth user provided");
  }

  // 1. Check if already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!fetchError && existingUser) {
    console.log("ℹ️ [ensureUserInDb] User already exists:", existingUser.id);
    return existingUser;
  }

  // 2. Default role = parent
  const finalRole: "admin" | "parent" | "student" | "teacher" =
    role ??
    (authUser.user_metadata?.role as "admin" | "parent" | "student" | "teacher") ??
    "parent";

  // 3. Insert new row
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: authUser.id,
      email: authUser.email ?? "",
      name: authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? "New User",
      role: finalRole,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ [ensureUserInDb] Error inserting user:", error.message);
    throw error;
  }

  console.log("✅ [ensureUserInDb] User created in DB:", data.id);
  return data;
}
