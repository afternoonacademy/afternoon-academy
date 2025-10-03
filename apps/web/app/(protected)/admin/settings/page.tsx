"use client";

import { Cog6ToothIcon, BookOpenIcon, CalendarDaysIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useSettings } from "@repo/hooks/useSettings";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSettingsPage() {
  const router = useRouter();

  // Load academy name from settings table
  const { value: academyName, saveSetting } = useSettings<string>("academy_name", "Afternoon Academy");
  const [localName, setLocalName] = useState(academyName);

  async function handleSave() {
    await saveSetting(localName);
    alert("✅ Academy name saved.");
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Cog6ToothIcon className="h-7 w-7 text-gray-700" />
        Admin Settings
      </h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">⚙️ General Settings</h2>
          <p className="text-gray-600 text-sm mb-4">Configure global settings for Afternoon Academy.</p>
          <label className="block mb-2 text-sm font-medium text-gray-700">Academy Name</label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-3"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save General Settings
          </button>
        </div>

        {/* Subjects */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">📚 Subjects & Timetable</h2>
          <p className="text-gray-600 text-sm mb-3">Add or remove subjects and define time slots available for booking.</p>
          <button
            onClick={() => router.push("/admin/subjects")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Manage Subjects
          </button>
        </div>

        {/* Scheduler Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">🗓️ Scheduler Settings</h2>
          <p className="text-gray-600 text-sm mb-3">Configure availability request rules and scheduling parameters.</p>
          <button
            onClick={() => router.push("/admin/settings/scheduler")}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Open Scheduler Settings →
          </button>
        </div>

        {/* Billing */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">💳 Billing</h2>
          <p className="text-gray-600 text-sm">Connect payment methods and subscription plans.</p>
          <button
            onClick={() => alert("Billing integration coming soon!")}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Manage Billing
          </button>
        </div>
      </section>
    </main>
  );
}
