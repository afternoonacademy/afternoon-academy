"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@repo/store/auth.store";
import { supabase } from "@repo/lib/supabase.client";
import { useEffect, useState } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace("/sign-in");
  };

  // ✅ Load pending requests for teacher
  useEffect(() => {
    if (!user?.id) return;

    async function fetchRequests() {
      // Replace with your requests table / status column
      const { data, error } = await supabase
        .from("requests")
        .select("id")
        .eq("teacher_id", user.id)
        .eq("status", "pending");

      if (error) {
        console.error("❌ Failed to load requests:", error.message);
        return;
      }

      setPendingCount(data?.length || 0);
    }

    fetchRequests();
  }, [user]);

  const navItems = [
    { label: "📊 Dashboard", href: "/teacher" },
    { label: "📅 My Sessions", href: "/teacher/sessions" },
    { label: "🗓️ My Availability", href: "/teacher/availability" },
    { label: "👩‍🎓 My Students", href: "/teacher/students" },
    { label: "👤 Profile", href: "/teacher/profile" },
    {
      label: (
        <span className="flex items-center justify-between">
          📨 Requests
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </span>
      ),
      href: "/teacher/requests",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Afternoon Academy Teacher
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hi, {user?.name ?? "Teacher"}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white text-sm font-medium hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r p-6 flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={typeof item.label === "string" ? item.label : item.href}
              onClick={() => router.push(item.href)}
              className="text-left text-gray-700 hover:text-blue-600 font-medium transition flex justify-between items-center"
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
