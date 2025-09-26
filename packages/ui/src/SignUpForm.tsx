
import React, { useState } from "react";
import { View } from "react-native";
import { TextInput } from "./TextInput";
import { Button } from "./button";


type Props = {
  onSubmit: (email: string, password: string, name: string) => Promise<void>;
  loading?: boolean;
  footer?: React.ReactNode;
};

export function SignUpForm({ onSubmit, loading, footer }: Props) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.name) {
      alert("Please fill out all fields");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form.email.trim().toLowerCase(), form.password, form.name);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Sign-up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-4 bg-white rounded-lg p-5 w-full max-w-md">
      <TextInput
        placeholder="Name"
        value={form.name}
        onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
        label="Name"
      />
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
        {loading || isSubmitting ? "Loading..." : "Sign Up"}
      </Button>

      {footer && <View className="mt-3">{footer}</View>}
    </View>
  );
}
