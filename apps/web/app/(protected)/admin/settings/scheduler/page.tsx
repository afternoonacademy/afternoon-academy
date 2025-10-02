"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { supabase } from "@repo/lib/supabase.client";

interface SchedulerSettings {
  min_notice_for_extension: number; // hours
  max_extension_hours: number; // hours
  allow_outside_availability: boolean;
}

export default function SchedulerSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SchedulerSettings>({
    min_notice_for_extension: 6,
    max_extension_hours: 2,
    allow_outside_availability: true,
  });

  const [saving, setSaving] = useState(false);

  // TODO: replace with supabase fetch when table exists
  useEffect(() => {
    async function loadSettings() {
      // placeholder: if you later create a "settings" table in Supabase, fetch it here
      // const { data } = await supabase.from("settings").select("*").eq("key", "scheduler").single();
      // if (data) setSettings(data.value);
    }
    loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      // placeholder: replace with supabase upsert
      console.log("Saving settings:", settings);
      // await supabase.from("settings").upsert({ key: "scheduler", value: settings });
      alert("✅ Scheduler settings saved (placeholder).");
    } catch (err) {
      if (err instanceof Error) alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Cog6ToothIcon className="h-7 w-7 text-gray-700" />
        Scheduler Settings
      </h1>

      <section className="bg-white shadow rounded-lg p-6 space-y-6 max-w-xl">
        {/* Min Notice */}
        <div>
          <label className="block font-medium mb-1">
            Minimum Notice for Extension (hours)
          </label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-3 py-2"
            value={settings.min_notice_for_extension}
            onChange={(e) =>
              setSettings({
                ...settings,
                min_notice_for_extension: parseInt(e.target.value, 10),
              })
            }
          />
          <p className="text-sm text-gray-500 mt-1">
            Example: 6 means no extension requests allowed within 6 hours of session start.
          </p>
        </div>

        {/* Max Extension */}
        <div>
          <label className="block font-medium mb-1">
            Maximum Extension Allowed (hours)
          </label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-3 py-2"
            value={settings.max_extension_hours}
            onChange={(e) =>
              setSettings({
                ...settings,
                max_extension_hours: parseInt(e.target.value, 10),
              })
            }
          />
          <p className="text-sm text-gray-500 mt-1">
            Example: 2 means teachers can only be asked to extend up to 2 additional hours.
          </p>
        </div>

        {/* Allow outside availability */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowOutside"
            checked={settings.allow_outside_availability}
            onChange={(e) =>
              setSettings({
                ...settings,
                allow_outside_availability: e.target.checked,
              })
            }
          />
          <label htmlFor="allowOutside" className="font-medium">
            Allow sessions to be created outside availability
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </section>
    </main>
  );
}
