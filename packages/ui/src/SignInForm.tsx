import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextInput, Button } from "@repo/ui";

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function SignInForm({ onSubmit }: Props) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("Please enter a valid email & password.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form.email.trim().toLowerCase(), form.password);
    } catch (err: any) {
      alert(err?.message ?? "Sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-6 bg-white rounded-lg p-5 mt-5 w-full max-w-md">
      <TextInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(t) => setForm((p) => ({ ...p, password: t }))}
        label="Password"
        secureTextEntry
      />
      <Button onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Sign In"}
      </Button>
      <View className="flex flex-row justify-center gap-2 mt-3">
        <Text className="text-gray-600">Don’t have an account?</Text>
        <Text className="font-semibold text-blue-500">Sign Up</Text>
      </View>
    </View>
  );
}
