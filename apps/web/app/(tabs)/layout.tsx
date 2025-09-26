// apps/web/app/(tabs)/layout.tsx
"use client";

import AuthGate from "../../components/AuthGate";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
