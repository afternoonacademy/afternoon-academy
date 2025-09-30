"use client";

import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function AdminSettingsPage() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Cog6ToothIcon className="h-7 w-7 text-gray-700" />
        Admin Settings
      </h1>

      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h2 className="font-semibold mb-2">General Settings</h2>
          <p className="text-gray-600 text-sm">
            Configure global settings for Afternoon Academy.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Subjects & Timetable</h2>
          <p className="text-gray-600 text-sm">
            Add or remove subjects and define time slots available for booking.
          </p>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Manage Subjects
          </button>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Billing</h2>
          <p className="text-gray-600 text-sm">
            Connect payment methods and subscription plans.
          </p>
        </div>
      </section>
    </main>
  );
}
