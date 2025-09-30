"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingAdded: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  onBookingAdded,
}: BookingModalProps) {
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [saving, setSaving] = useState(false);

  // Load parents + sessions when modal opens
  useEffect(() => {
    if (!isOpen) return;

    supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "parent")
      .then(({ data }) => setParents(data || []));

    supabase
      .from("sessions")
      .select("id, start_time, end_time, subjects(name)")
      .order("start_time", { ascending: true })
      .then(({ data }) => setSessions(data || []));
  }, [isOpen]);

  // Load students for selected parent
  useEffect(() => {
    if (!parentId) {
      setStudents([]);
      setStudentId("");
      return;
    }

    supabase
      .from("students")
      .select("id, name, age")
      .eq("parent_id", parentId)
      .then(({ data }) => setStudents(data || []));
  }, [parentId]);

  async function handleSave() {
    if (!parentId || !studentId || !sessionId) {
      alert("Please select parent, student, and session");
      return;
    }
    setSaving(true);

    const { error } = await supabase.from("bookings").insert([
      {
        parent_id: parentId,
        student_id: studentId,
        session_id: sessionId,
        status: "confirmed",
      },
    ]);

    setSaving(false);

    if (error) {
      alert("❌ Failed to create booking: " + error.message);
    } else {
      onBookingAdded();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">➕ Add Booking</h2>

        <div className="space-y-4">
          {/* Parent Select */}
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select Parent</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>

          {/* Student Select */}
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border rounded px-2 py-1"
            disabled={!parentId}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Age {s.age})
              </option>
            ))}
          </select>

          {/* Session Select */}
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subjects?.name} –{" "}
                {new Date(s.start_time).toLocaleString("en-GB")}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
