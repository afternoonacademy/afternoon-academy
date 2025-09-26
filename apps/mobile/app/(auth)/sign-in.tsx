import React from "react";
import { router } from "expo-router";
import { SignInForm } from "@repo/ui";
import { signIn } from "@repo/lib/appwrite.native";
import useAuthStore from "@repo/store/auth.store";

export default function SignInScreen() {
  const { fetchAuthenticatedUser } = useAuthStore();

  const handleSubmit = async (email: string, password: string) => {
    await signIn({ email, password });
    await fetchAuthenticatedUser();
    router.replace("/"); // ✅ mobile redirect
  };

  return <SignInForm onSubmit={handleSubmit} />;
}
