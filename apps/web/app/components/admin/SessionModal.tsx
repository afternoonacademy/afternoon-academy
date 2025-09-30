"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import { Avatar } from "@/app/components/ui/Avatar";
import {
  Combobox,
  ComboboxLabel,
  ComboboxOption,
} from "@/app/components/ui/Combobox";
import { Field, Label } from "@/app/components/ui/FieldSet";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded: () => void;
  editingSession?: any | null;
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

export default function SessionModal({
  isOpen,
  onClose,
  onSessionAdded,
  editingSession,
}: SessionModalProps) {
  const [venues, setVenues] = useState<any[]>([]);
  const [form, setForm] = useState({
    teacher_id: "",
    venue_id: "",
    duration: 1,
    capacity: 10,
    status: "scheduled",
  });

  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");

  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [warning, setWarning] = useState("");
  const [saving, setSaving] = useState(false);

  // Load venues
  useEffect(() => {
    async function loadData() {
      const { data: ven } = await supabase.from("venues").select("id, name");
      setVenues(ven || []);
    }
    if (isOpen) loadData();
  }, [isOpen]);

  // Pre-fill when editing
  useEffect(() => {
    if (editingSession) {
      setForm({
        teacher_id: editingSession.teacher?.id || "",
        venue_id: editingSession.venues?.id || "",
        duration: 1,
        capacity: editingSession.capacity || 10,
        status: editingSession.status || "scheduled",
      });

      if (editingSession.start_time) {
        const s = splitDateTime(editingSession.start_time);
        setStartDate(s.date);
        setStartHour(s.hour);
        setStartMinute(s.minute);
      }
    } else {
      setForm({
        teacher_id: "",
        venue_id: "",
        duration: 1,
        capacity: 10,
        status: "scheduled",
      });
      setStartDate("");
      setStartHour("00");
      setStartMinute("00");
    }
  }, [editingSession]);

  // Availability check
  useEffect(() => {
    async function checkAvailability() {
      if (!startDate) return;

      const startIso = combineDateTime(startDate, startHour, startMinute);
      const start = new Date(startIso);
      const end = new Date(start);
      end.setHours(start.getHours() + Math.floor(form.duration));
      if (form.duration % 1 !== 0) end.setMinutes(start.getMinutes() + 30);

      const sessionStart = start.toISOString();
      const sessionEnd = end.toISOString();

      const { data, error } = await supabase
        .from("availabilities")
        .select(
          `id, teacher_id, users!availabilities_teacher_id_fkey ( id, name )`
        )
        .eq("status", "open")
        .lte("start_time", sessionStart)
        .gte("end_time", sessionEnd);

      if (error) {
        console.error("❌ Availability check failed:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setAvailableTeachers(
          data.map((a: any) => ({
            id: a.users?.id,
            name: a.users?.name,
            availabilityId: a.id,
            avatarUrl: null,
          }))
        );
        setWarning("");
      } else {
        setAvailableTeachers([]);
        setWarning("⚠️ No teachers available for this slot.");
      }
    }

    checkAvailability();
  }, [startDate, startHour, startMinute, form.duration]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const startIso = combineDateTime(startDate, startHour, startMinute);
      const start = new Date(startIso);
      const end = new Date(start);
      end.setHours(start.getHours() + Math.floor(form.duration));
      if (form.duration % 1 !== 0) end.setMinutes(start.getMinutes() + 30);

      const payload = {
        teacher_id: form.teacher_id || null,
        venue_id: form.venue_id || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: form.capacity,
        status: form.status,
      };

      if (editingSession) {
        await supabase.from("sessions").update(payload).eq("id", editingSession.id);
      } else {
        const { error: insertError } = await supabase
          .from("sessions")
          .insert([payload]);
        if (insertError) throw insertError;

        // 🔵 Update availability status → "ready"
        if (form.teacher_id) {
          const { error: availError } = await supabase
            .from("availabilities")
            .update({ status: "ready" })
            .eq("teacher_id", form.teacher_id)
            .lte("start_time", start.toISOString())
            .gte("end_time", end.toISOString());

          if (availError) {
            console.error("❌ Failed to update availability:", availError.message);
          }
        }
      }

      onSessionAdded();
      onClose();
    } catch (err: any) {
      alert("❌ Failed to save session: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const startLabel =
    startDate &&
    `${startDate} ${startHour}:${startMinute} (${form.duration}h)`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-2">
          {editingSession ? "✏️ Edit Session" : "➕ Add Session"}
        </h2>
        {startLabel && (
          <p className="text-sm text-gray-600 mb-4">Start: {startLabel}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teacher */}
          <Field>
            <Label>Teacher</Label>
            {availableTeachers.length > 0 ? (
              <Combobox
                name="teacher"
                options={availableTeachers}
                displayValue={(t) => t?.name}
                value={
                  availableTeachers.find((t) => t.id === form.teacher_id) || null
                }
                onChange={(val) =>
                  setForm({ ...form, teacher_id: val ? val.id : "" })
                }
              >
                {(t) => (
                  <ComboboxOption value={t}>
                    <Avatar
                      src={t.avatarUrl}
                      initials={t.name?.[0] || "T"}
                      className="bg-purple-500 text-white"
                      alt=""
                    />
                    <ComboboxLabel>{t.name}</ComboboxLabel>
                  </ComboboxOption>
                )}
              </Combobox>
            ) : (
              <p className="text-red-600 text-sm">{warning}</p>
            )}
          </Field>

          {/* Venue */}
          <Field>
            <Label>Venue</Label>
            <select
              value={form.venue_id}
              onChange={(e) => setForm({ ...form, venue_id: e.target.value })}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">— Select Venue —</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Start Date + Time */}
          <Field>
            <Label>Start Time</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
            <div className="flex gap-2 mt-1">
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
          </Field>

          {/* Duration */}
          <Field>
            <Label>Duration</Label>
            <select
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: parseFloat(e.target.value) })
              }
              className="w-full border rounded px-2 py-1"
            >
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
            </select>
          </Field>

          {/* Capacity */}
          <Field>
            <Label>Capacity</Label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              className="w-full border px-2 py-1 rounded"
              min={1}
            />
          </Field>

          {/* Status */}
          <Field>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </Field>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingSession ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
