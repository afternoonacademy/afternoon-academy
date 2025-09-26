// packages/ui/src/Button.tsx
"use client";

import * as React from "react";
import { Platform, Pressable, Text, StyleSheet } from "react-native";

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean; // 👈 add this
}

export function Button({ children, onPress, disabled }: ButtonProps) {
  if (Platform.OS === "web") {
    return (
      <button
        onClick={onPress}
        disabled={disabled}
        style={{
          padding: "12px 20px",
          borderRadius: "8px",
          backgroundColor: disabled ? "#9ca3af" : "#0070f3",
          color: "white",
          fontWeight: "bold",
          cursor: disabled ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        disabled && { backgroundColor: "#9ca3af" },
      ]}
      disabled={disabled}
    >
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#0070f3",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});
