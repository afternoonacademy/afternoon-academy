"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@repo/ui/AppSidebar";

export default function BaseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 transition-colors">
        {children}
      </main>
    </div>
  );
}
