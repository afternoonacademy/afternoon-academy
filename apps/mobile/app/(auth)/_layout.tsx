"use client";

import { Slot } from "expo-router";

export default function AuthLayout() {
  // Auth screens should always be public
  return <Slot />;
}
