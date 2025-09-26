"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import useAuthStore from "@repo/store/auth.store";

export default function ParentLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Afternoon Academy</h1>
        <nav className="flex gap-4">
          <Link href="/parent">🏠 Dashboard</Link>
          <Link href="/parent/settings">⚙️ Settings</Link>
        </nav>
      </header>

      {/* Welcome bar */}
      <div className="bg-gray-100 px-6 py-3 border-b text-gray-700">
        Welcome back, <strong>{user?.name ?? "Parent"}</strong>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-white p-6">{children}</main>
    </div>
  );
}
