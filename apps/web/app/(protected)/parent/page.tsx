"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@repo/store/auth.store";

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          👋 Welcome back, {user?.name ?? "Parent"}
        </h1>
        <p className="text-gray-600">
          Here’s what’s happening with your child’s learning this week.
        </p>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📅 Upcoming Sessions</h2>
          <ul className="space-y-3">
            <li className="p-3 bg-gray-100 rounded-lg">
              <p className="font-medium">Math Homework Help</p>
              <p className="text-sm text-gray-500">Mon, Sep 29 @ 17:00</p>
              <p className="text-xs text-gray-400">with Mr. Smith</p>
            </li>
            <li className="p-3 bg-gray-100 rounded-lg">
              <p className="font-medium">English Reading Support</p>
              <p className="text-sm text-gray-500">Wed, Oct 1 @ 18:30</p>
              <p className="text-xs text-gray-400">with Ms. Johnson</p>
            </li>
          </ul>
          <button
            onClick={() => router.push("/book-session")}
            className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            ➕ Book a New Session
          </button>
        </section>

        {/* Progress Reports */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📈 Progress Reports</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Math: Improving focus</p>
              <p className="text-sm text-gray-500">Feedback from Mr. Smith</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">English: Needs practice</p>
              <p className="text-sm text-gray-500">Feedback from Ms. Johnson</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/parent/reports")}
            className="mt-4 text-blue-600 font-semibold underline"
          >
            View All Reports →
          </button>
        </section>

        {/* Billing / Subscription */}
        <section className="bg-white rounded-xl shadow p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">💳 Billing & Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan: Standard</p>
              <p className="text-sm text-gray-500">Renews Oct 15, 2025</p>
            </div>
            <button
              onClick={() => router.push("/billing")}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Manage Subscription
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
