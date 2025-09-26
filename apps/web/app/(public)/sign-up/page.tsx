"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import { SignUpForm } from "@repo/ui";
import useAuthStore from "@repo/store/auth.store";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { fetchAuthenticatedUser } = useAuthStore();

  // ✅ Role comes from ?role=parent|student|teacher — defaults to parent
  const role =
    (searchParams.get("role") as "parent" | "student" | "teacher") ?? "parent";

  const handleSubmit = async (email: string, password: string, name: string) => {
    console.log("🟢 [SignUpPage] handleSubmit called", { email, role });

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") +
            "/auth/callback",
          data: { name, role }, // ✅ metadata stored in Supabase
        },
      });

      if (error) throw error;
      console.log("✅ [SignUpPage] Auth account created:", data);

      // 👇 Refresh the store so AuthGate has the new user immediately
      await fetchAuthenticatedUser(true);

      // Get latest user profile from store
      const profile = useAuthStore.getState().user;
      if (!profile) {
        console.warn("⚠️ [SignUpPage] No user profile found after signup");
        router.replace("/sign-in");
        return;
      }

      console.log("🔄 [SignUpPage] Loaded profile:", profile);

      // ✅ Navigate immediately based on role
      switch (profile.role) {
        case "admin":
          router.replace("/admin");
          break;
        case "parent":
          router.replace("/parent");
          break;
        case "student":
          router.replace("/student");
          break;
        case "teacher":
          router.replace("/teacher");
          break;
        default:
          router.replace("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ [SignUpPage] unexpected error:", err.message);
        alert(err.message);
      } else {
        console.error("❌ [SignUpPage] unexpected non-Error:", err);
        alert("Sign-up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <SignUpForm onSubmit={handleSubmit} loading={loading} />
    </main>
  );
}

// ✅ Wrap in Suspense for Vercel builds
export default function SignUpPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SignUpContent />
    </Suspense>
  );
}
