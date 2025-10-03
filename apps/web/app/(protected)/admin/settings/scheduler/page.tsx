"use client";

import { useSettings } from "@repo/hooks/useSettings";
import { useState, useEffect } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface SchedulerRules {
  min_notice_hours: number;
  max_extension_hours: number;
}

export default function SchedulerSettingsPage() {
  const { value: rules, saveSetting, loading } = useSettings<SchedulerRules>("request_rules", {
    min_notice_hours: 6,
    max_extension_hours: 2,
  });

  const [localRules, setLocalRules] = useState<SchedulerRules>(rules);

  useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  if (loading) return <p className="p-6">Loading scheduler settings...</p>;

  async function handleSave() {
    await saveSetting(localRules);
    alert("✅ Scheduler rules updated.");
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Cog6ToothIcon className="h-7 w-7 text-gray-700" />
        Scheduler Settings
      </h1>

      <section className="bg-white shadow rounded-lg p-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Notice (hours)
          </label>
          <input
            type="number"
            value={localRules.min_notice_hours}
            onChange={(e) =>
              setLocalRules({ ...localRules, min_notice_hours: parseInt(e.target.value) })
            }
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Extension (hours)
          </label>
          <input
            type="number"
            value={localRules.max_extension_hours}
            onChange={(e) =>
              setLocalRules({ ...localRules, max_extension_hours: parseInt(e.target.value) })
            }
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Scheduler Rules
        </button>
      </section>
    </main>
  );
}
