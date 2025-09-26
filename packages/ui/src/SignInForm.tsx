// packages/ui/src/SignInForm.tsx

import React, { useState } from "react";
import { View } from "react-native";
import { TextInput } from "./TextInput";
import { Button } from "./button";


type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  footer?: React.ReactNode;
};

export function SignInForm({ onSubmit, loading, footer }: Props) {
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-4 bg-white rounded-lg p-5 w-full max-w-md">
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        onChangeText={(t) => setForm((p) => ({ ...p, password: t }))}
        label="Password"
        secureTextEntry
      />
      <Button onPress={handleSubmit} disabled={loading || isSubmitting}>
        {loading || isSubmitting ? "Loading..." : "Sign In"}
      </Button>

      {footer && <View className="mt-3">{footer}</View>}
    </View>
  );
}
