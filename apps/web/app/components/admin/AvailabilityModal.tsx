"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/lib/supabase.client";

export interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  availability: {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    teacher_id?: string | null;
  } | null;
  onSaved: () => Promise<void>;
  onDeleted?: () => Promise<void>;
}

interface Teacher {
  id: string;
  name: string;
}

function combineDateTime(date: string, hour: string, minute: string): string {
  if (!date) return "";
  const iso = new Date(`${date}T${hour}:${minute}:00`);
  return iso.toISOString();
}

function splitDateTime(datetime: string | null) {
  if (!datetime) return { date: "", hour: "00", minute: "00" };
  const d = new Date(datetime);
  return {
    date: d.toISOString().slice(0, 10),
    hour: String(d.getHours()).padStart(2, "0"),
    minute: ["00", "15", "30", "45"].includes(
      String(d.getMinutes()).padStart(2, "0")
    )
      ? String(d.getMinutes()).padStart(2, "0")
      : "00",
  };
}

export default function AvailabilityModal({
  isOpen,
  onClose,
  availability,
  onSaved,
  onDeleted,
}: AvailabilityModalProps) {
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [status, setStatus] = useState("open");

  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    supabase
      .from("users")
      .select("id, name")
      .eq("role", "teacher")
      .then(({ data }) => setTeachers((data as Teacher[]) || []));

    setTeacherId(availability?.teacher_id || "");
    setStatus(availability?.status || "open");

    if (availability?.start_time && availability?.end_time) {
      const s = splitDateTime(availability.start_time);
      setStartDate(s.date);
      setStartHour(s.hour);
      setStartMinute(s.minute);

      const diffMs =
        new Date(availability.end_time).getTime() -
        new Date(availability.start_time).getTime();
      setDuration(diffMs / (1000 * 60 * 60));
    } else {
      setStartDate("");
      setStartHour("00");
      setStartMinute("00");
      setDuration(1);
    }
  }, [isOpen, availability]);

  if (!isOpen) return null;

  async function handleSave() {
    setSaving(true);

    const startIso = combineDateTime(startDate, startHour, startMinute);
    const start = new Date(startIso);
    const end = new Date(start);
    end.setHours(start.getHours() + Math.floor(duration));
    if (duration % 1 !== 0) end.setMinutes(start.getMinutes() + 30);

    const payload = {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status,
      teacher_id: teacherId || null,
    };

    if (availability?.id) {
      console.log("✏️ Updating availability", availability.id);
      await supabase.from("availabilities").update(payload).eq("id", availability.id);
    } else {
      console.log("➕ Inserting new availability");
      await supabase.from("availabilities").insert([payload]);
    }

    setSaving(false);
    await onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!availability?.id) return;

    if (!confirm("Delete this availability?")) return;
    setSaving(true);

    await supabase.from("availabilities").delete().eq("id", availability.id);

    setSaving(false);
    if (onDeleted) await onDeleted();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-lg md:rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {availability?.id ? "Edit Availability" : "Add Availability"}
        </h2>

        <div className="space-y-4">
          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />

          {/* Hour & Minute */}
          <div className="flex gap-2">
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, "0")}>
                  {String(i).padStart(2, "0")}
                </option>
              ))}
            </select>

            <select
              value={startMinute}
              onChange={(e) => setStartMinute(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {["00", "15", "30", "45"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <select
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full border rounded px-2 py-1"
          >
            <option value="1">1 hour</option>
            <option value="1.5">1.5 hours</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
          </select>

          {/* Teacher */}
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="open">Open</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-6">
          {availability?.id && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 border rounded">
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
    </div>
  );
}
