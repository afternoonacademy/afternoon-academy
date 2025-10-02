"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";

type Availability = {
  id: string;
  start_time: string;
  end_time: string;
  subjects: { name: string } | null;
  users: { name: string } | null;
};

export default function BookSessionPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const fetchAvailabilities = async () => {
      const { data, error } = await supabase
        .from("availabilities")
        .select("id, start_time, end_time, subjects(name), users(name)")
        .eq("status", "available") // ✅ FIXED
        .order("start_time");

      if (error) {
        console.error("❌ Failed to fetch availabilities:", error.message);
        return;
      }
      setSlots(data || []);
      setLoading(false);
    };

    fetchAvailabilities();
  }, []);

  const handleBooking = async () => {
    if (!selectedId || !user?.id) {
      alert("Please select a slot first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("availabilities")
        .update({
          parent_id: user.id,
          status: "booked", // ✅ valid enum
        })
        .eq("id", selectedId);

      if (error) throw error;

      console.log("✅ Session booked successfully");
      router.replace("/parent/sessions");
    } catch (err: any) {
      console.error("❌ Booking failed:", err.message);
      alert(err.message ?? "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-gray-500">⏳ Loading available slots...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">➕ Book a New Session</h1>

      {slots.length === 0 ? (
        <p className="text-gray-500">No available slots at the moment.</p>
      ) : (
        <div className="space-y-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select an available slot</option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.subjects?.name ?? "General"} — {slot.users?.name ?? "TBA"} —{" "}
                {new Date(slot.start_time).toLocaleString()} →{" "}
                {new Date(slot.end_time).toLocaleTimeString()}
              </option>
            ))}
          </select>

          <button
            onClick={handleBooking}
            disabled={!selectedId || loading}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </main>
  );
}
