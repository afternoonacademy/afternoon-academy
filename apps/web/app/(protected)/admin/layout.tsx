"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@repo/store/auth.store";
import { supabase } from "@repo/lib/supabase.client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout(); // clear auth store
    router.replace("/sign-in");
  };

  const navItems = [
    { label: "📊 Dashboard", href: "/admin" },
    { label: "👥 Users", href: "/admin/users" },
    { label: "📚 Subjects", href: "/admin/subjects" },
    { label: "🗓️ Availabilities", href: "/admin/availabilities" },
    { label: "📑 Bookings", href: "/admin/bookings" },
    { label: "📅 Sessions", href: "/admin/sessions" },
    { label: "🏢 Venues", href: "/admin/venues" },
    { label: "⚙️ Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Afternoon Academy Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hi, {user?.name ?? "Admin"}</span>
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
              key={item.href}
              onClick={() => router.push(item.href)}
              className="text-left text-gray-700 hover:text-blue-600 font-medium transition"
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
