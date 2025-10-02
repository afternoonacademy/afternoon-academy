"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

interface Alert {
  id: string;
  type: string;
  related_id: string;
  related_table: string;
  message: string;
  status: string;
  created_at: string;
  created_by: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setAlerts(data);
    }
    loadAlerts();
  }, []);

  async function markRead(id: string) {
    await supabase.from("alerts").update({ status: "read" }).eq("id", id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "read" } : a))
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔔 Alerts</h1>

      <div className="space-y-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-4 border rounded-lg shadow-sm ${
              a.status === "unread" ? "bg-yellow-50 border-yellow-300" : "bg-white"
            }`}
          >
            <p className="font-medium">{a.message}</p>
            <p className="text-sm text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
            {a.status === "unread" && (
              <button
                onClick={() => markRead(a.id)}
                className="mt-2 px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
