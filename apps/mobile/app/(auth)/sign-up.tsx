"use client";

import React from "react";
import { View, Text } from "react-native";
import { router, Link, useLocalSearchParams } from "expo-router";
import { SignUpForm } from "@repo/ui";
import { supabase } from "@repo/lib/supabase.client";
import * as Linking from "expo-linking";

export default function SignUpScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: "parent" | "student" | "teacher" }>();
  const role = roleParam ?? "parent";

  const handleSubmit = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = Linking.createURL("auth/callback");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name, role },
        },
      });

      if (error) throw error;

      router.replace("/check-email");
    } catch (err) {
      console.error("❌ [SignUpScreen] Error during sign up:", err);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-6 gap-6">
      <SignUpForm
        onSubmit={handleSubmit}
        footer={
          <Link href="/sign-in" asChild>
            <Text className="font-semibold text-blue-500">
              Already have an account? Sign In
            </Text>
          </Link>
        }
      />
    </View>
  );
}
