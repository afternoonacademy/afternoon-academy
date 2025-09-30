"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import {
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    subjects: 0,
    sessions: 0,
    bookings: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [{ count: userCount }, { count: subjectCount }, { count: sessionCount }, { count: bookingCount }] =
        await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("subjects").select("id", { count: "exact", head: true }),
          supabase.from("sessions").select("id", { count: "exact", head: true }),
          supabase.from("bookings").select("id", { count: "exact", head: true }),
        ]);

      setStats({
        users: userCount || 0,
        subjects: subjectCount || 0,
        sessions: sessionCount || 0,
        bookings: bookingCount || 0,
      });
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Users",
      description: "Parents, students, and teachers.",
      icon: <UsersIcon className="h-6 w-6 text-blue-600" />,
      count: stats.users,
      href: "/admin/users",
    },
    {
      title: "Subjects",
      description: "Manage available subjects.",
      icon: <BookOpenIcon className="h-6 w-6 text-green-600" />,
      count: stats.subjects,
      href: "/admin/subjects",
    },
    {
      title: "Sessions",
      description: "Upcoming and past learning sessions.",
      icon: <CalendarDaysIcon className="h-6 w-6 text-orange-600" />,
      count: stats.sessions,
      href: "/admin/sessions",
    },
    {
      title: "Bookings",
      description: "Confirmed and pending student bookings.",
      icon: <ChartBarIcon className="h-6 w-6 text-purple-600" />,
      count: stats.bookings,
      href: "/admin/bookings",
    },
  ];

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => router.push(card.href)}
            className="bg-white shadow rounded-lg p-4 flex flex-col items-start text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-2">
              {card.icon}
              <h2 className="font-semibold">{card.title}</h2>
            </div>
            <p className="text-gray-600 mb-2">{card.description}</p>
            <span className="text-2xl font-bold text-gray-800">
              {card.count}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
