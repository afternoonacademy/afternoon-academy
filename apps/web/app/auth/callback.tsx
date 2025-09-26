"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import { ensureUserInDb } from "@repo/lib/ensureUserInDb"; // ✅ shared helper
import useAuthStore from "@repo/store/auth.store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchAuthenticatedUser } = useAuthStore();

  useEffect(() => {
    let ran = false;

    const handleCallback = async () => {
      if (ran) return;
      ran = true;

      console.log("🔵 [AuthCallback:Web] Starting callback flow...");

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session?.user) {
          console.error("❌ [AuthCallback:Web] Invalid session:", error ?? data);
          router.replace("/sign-in");
          return;
        }

        const user = data.session.user;
        console.log("✅ [AuthCallback:Web] Session restored. User:", user);

        // ✅ Decide role (default = parent)
        let role: "admin" | "parent" | "student" | "teacher" = "parent";

        if (user.email?.endsWith("@afternoonacademy.com")) {
          role = "admin";
        } else if (user.user_metadata?.role === "student") {
          role = "student";
        } else if (user.user_metadata?.role === "teacher") {
          role = "teacher";
        }

        // ✅ Ensure row in DB
        await ensureUserInDb(user, role);

        // ✅ Refresh Zustand auth store
        await fetchAuthenticatedUser(true);

        // ✅ Redirect based on role
        switch (role) {
          case "admin":
            router.replace("/admin");
            break;
          case "student":
            router.replace("/student");
            break;
          case "teacher":
            router.replace("/teacher");
            break;
          default:
            router.replace("/parent");
        }
      } catch (err) {
        console.error("⚠️ [AuthCallback:Web] Unexpected error:", err);
        router.replace("/sign-in");
      }
    };

    handleCallback();
  }, [router, fetchAuthenticatedUser]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-blue-600">🔄 Finishing login, please wait...</p>
    </main>
  );
}
