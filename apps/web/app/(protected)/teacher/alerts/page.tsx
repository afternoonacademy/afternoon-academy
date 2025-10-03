"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/app/components/ui/Table";
import { Badge } from "@/app/components/ui/Badge";

interface Alert {
  id: string;
  type: string;
  message: string;
  status: "unread" | "read" | "resolved";
  priority: "info" | "warning" | "urgent";
  created_at: string;
}

export default function TeacherAlertsPage() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function loadAlerts() {
      const { data, error } = await supabase
        .from("alerts")
        .select("id, type, message, status, priority, created_at")
        .eq("target_user", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Failed to load alerts:", error.message);
      } else {
        setAlerts(data as Alert[]);
      }
      setLoading(false);
    }

    loadAlerts();
  }, [user?.id]);

  async function markRead(id: string) {
    await supabase.from("alerts").update({ status: "read" }).eq("id", id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "read" } : a))
    );
  }

  if (loading) return <p>Loading alerts...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🔔 My Alerts</h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Type</TableHeader>
            <TableHeader>Message</TableHeader>
            <TableHeader>Priority</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((a) => (
            <TableRow
              key={a.id}
              className={a.status === "unread" ? "bg-yellow-50" : ""}
            >
              <TableCell>{a.type}</TableCell>
              <TableCell>{a.message}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    a.priority === "urgent"
                      ? "destructive"
                      : a.priority === "warning"
                      ? "outline"
                      : "default"
                  }
                >
                  {a.priority}
                </Badge>
              </TableCell>
              <TableCell>{a.status}</TableCell>
              <TableCell>
                {new Date(a.created_at).toLocaleString("en-GB")}
              </TableCell>
              <TableCell>
                {a.status === "unread" && (
                  <button
                    onClick={() => markRead(a.id)}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark Read
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
