"use client";

import useAuthStore from "@repo/store/auth.store";

export default function ParentDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Greeting */}
      <h2 className="text-3xl font-bold mb-6">
        👋 Welcome back, {user?.name ?? "Parent"}!
      </h2>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">📚 My Children</h3>
          <p className="text-gray-600">
            View and manage your children’s profiles and enrolled sessions.
          </p>
        </div>

        <div className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">📝 Homework Sessions</h3>
          <p className="text-gray-600">
            See upcoming after-school sessions and homework assignments.
          </p>
        </div>

        <div className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">💳 Billing</h3>
          <p className="text-gray-600">
            Review payments, invoices, and update your subscription.
          </p>
        </div>

        <div className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">⚙️ Settings</h3>
          <p className="text-gray-600">
            Manage your account preferences and security.
          </p>
        </div>
      </div>
    </div>
  );
}
