"use client";

import { SignInForm } from "@repo/ui";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { fetchAuthenticatedUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (email: string, password: string) => {
    console.log("🟢 [SignInPage] handleSubmit called", { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ [SignInPage] handleSubmit error:", error.message);
        alert(error.message);
        return;
      }

      console.log("✅ [SignInPage] signIn success:", data);

      // Refresh store (forces profile reload from `users` table)
      await fetchAuthenticatedUser();

      // Get latest user profile from store
      const profile = useAuthStore.getState().user;
      if (!profile) {
        console.warn("⚠️ [SignInPage] No user profile found after login");
        router.replace("/sign-in");
        return;
      }

      console.log("🔄 [SignInPage] Loaded profile:", profile);

      // ✅ Navigate based on role
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
          console.warn("⚠️ [SignInPage] Unknown role, defaulting to /sign-in");
          router.replace("/sign-in");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ [SignInPage] unexpected error:", err.message);
        alert(err.message);
      } else {
        console.error("❌ [SignInPage] unexpected non-Error:", err);
        alert("Sign-in failed");
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <SignInForm
        onSubmit={handleSubmit}
        footer={
          <div className="flex flex-row justify-center gap-2 mt-3">
            <span className="text-gray-600">Don’t have an account?</span>
            <Link href="/sign-up" className="font-semibold text-blue-500">
              Sign Up
            </Link>
          </div>
        }
      />
    </main>
  );
}
