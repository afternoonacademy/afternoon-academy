"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  subjects: { name: string } | null;
  users: { name: string } | null; // teacher
};

export default function ParentSessionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("availabilities") // ✅ using availabilities as the source of booked sessions
        .select("id, start_time, end_time, status, subjects(name), users(name)")
        .eq("parent_id", user.id)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("❌ Failed to fetch sessions:", error.message);
        return;
      }

      setSessions(data || []);
      setLoading(false);
    };

    fetchSessions();
  }, [user?.id]);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-gray-500">⏳ Loading sessions...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">📅 Your Sessions</h1>
        <p className="text-gray-600">Manage and review your booked lessons.</p>
      </header>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions booked yet.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="bg-white shadow rounded-lg p-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">{s.subjects?.name ?? "General"}</p>
                <p className="text-sm text-gray-500">
                  {new Date(s.start_time).toLocaleString()} →{" "}
                  {new Date(s.end_time).toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-400">
                  Teacher: {s.users?.name ?? "TBA"}
                </p>
                <p className="text-xs text-gray-400">Status: {s.status}</p>
              </div>
              <button
                onClick={() => router.push(`/parent/sessions/${s.id}`)}
                className="text-blue-600 font-medium"
              >
                View →
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => router.push("/parent/sessions/book")}
        className="mt-6 w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        ➕ Book New Session
      </button>
    </main>
  );
}
