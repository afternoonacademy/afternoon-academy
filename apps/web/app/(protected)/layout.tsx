"use client";

import type { ReactNode } from "react";
import AuthGate from "../components/AuthGate";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  console.log("🟡 ProtectedLayout rendered");

  return <AuthGate>{children}</AuthGate>;
}
