"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";

type Session = {
  id: string;
  subject: string;
  start_time: string;
  end_time: string;
  status: string;
  teacher_id: string | null;
  notes?: string;
};

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Failed to fetch session:", error.message);
        return;
      }

      setSession(data);
      setLoading(false);
    };

    fetchSession();
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to cancel this session?")) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      console.log("✅ Session cancelled");
      alert("Session cancelled successfully.");
      router.replace("/parent/sessions");
    } catch (err: any) {
      console.error("❌ Failed to cancel session:", err.message);
      alert(err.message ?? "Failed to cancel session");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-gray-500">⏳ Loading session details...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="p-6">
        <p className="text-red-500">❌ Session not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 underline"
      >
        ← Back to Sessions
      </button>

      <section className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{session.subject}</h1>
        <p className="text-gray-600 mb-2">
          {new Date(session.start_time).toLocaleString()} →{" "}
          {new Date(session.end_time).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 mb-2">Status: {session.status}</p>
        {session.teacher_id && (
          <p className="text-sm text-gray-500">
            Assigned teacher: {session.teacher_id}
          </p>
        )}
        {session.notes && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">📓 Notes: {session.notes}</p>
          </div>
        )}

        {/* Cancel button (only if not already cancelled) */}
        {session.status !== "cancelled" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-6 w-full py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "❌ Cancel Session"}
          </button>
        )}
      </section>
    </main>
  );
}
