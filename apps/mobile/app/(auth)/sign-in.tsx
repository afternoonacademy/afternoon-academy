"use client";

import React from "react";
import { router, Link } from "expo-router";
import { SignInForm } from "@repo/ui";
import useAuthStore from "@repo/store/auth.store";
import { supabase } from "@repo/lib/supabase.client";
import { Text, View } from "react-native";

export default function SignInScreen() {
  const { fetchAuthenticatedUser } = useAuthStore();

  const handleSubmit = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ [SignInScreen] error:", error.message);
        alert(error.message);
        return;
      }

      await fetchAuthenticatedUser(true);

      const role = useAuthStore.getState().user?.role ?? "parent";
      if (role === "parent") router.replace("/parent");
      else if (role === "student") router.replace("/student");
      else if (role === "teacher") router.replace("/teacher");
      else if (role === "admin") router.replace("/admin");
    } catch (err: any) {
      console.error("❌ [SignInScreen] unexpected error:", err);
      alert(err?.message ?? "Sign-in failed");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-6 gap-6">
      <SignInForm
        onSubmit={handleSubmit}
        footer={
          <Link href="/sign-up" asChild>
            <Text className="font-semibold text-blue-500">Sign Up</Text>
          </Link>
        }
      />
    </View>
  );
}
