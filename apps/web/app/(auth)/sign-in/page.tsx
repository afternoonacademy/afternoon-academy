"use client";

import { SignInForm } from "@repo/ui";
import { signIn } from "@repo/lib/appwrite.web";
import useAuthStore from "@repo/store/auth.store";

export default function SignInPage() {
  const { fetchAuthenticatedUser } = useAuthStore();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await signIn({ email, password });
      await fetchAuthenticatedUser();
      window.location.href = "/"; // ✅ redirect after login
    } catch (err: any) {
      alert(err?.message ?? "Sign-in failed");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignInForm onSubmit={handleSubmit} />
    </main>
  );
}
