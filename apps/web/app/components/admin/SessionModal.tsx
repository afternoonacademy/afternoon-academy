"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import { Field, Label } from "@/app/components/ui/FieldSet";
import useAuthStore from "@repo/store/auth.store";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded: () => void;
  editingSession?: SessionRow | null;
}

interface Venue { id: string; name: string }
interface Subject { id: string; name: string }
interface TeacherOption {
  id: string;
  name: string;
  availabilityId?: string;
  avatarUrl?: string | null;
}

interface SessionRow {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  capacity: number;
  subject?: { id: string; name: string };
  teacher?: { id: string; name: string };
  venue?: { id: string; name: string };
}

function combineDateTime(date: string, hour: string, minute: string) {
  return date ? new Date(`${date}T${hour}:${minute}:00`).toISOString() : "";
}

function splitDateTime(datetime: string | null) {
  if (!datetime) return { date: "", hour: "00", minute: "00" };
  const d = new Date(datetime);
  return {
    date: d.toISOString().slice(0, 10),
    hour: String(d.getHours()).padStart(2, "0"),
    minute: String(d.getMinutes()).padStart(2, "0"),
  };
}

export default function SessionModal({
  isOpen,
  onClose,
  onSessionAdded,
  editingSession,
}: SessionModalProps) {
  const { user } = useAuthStore();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<TeacherOption[]>([]);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<string | null>(null);

  const [form, setForm] = useState({
    teacher_id: "",
    venue_id: "",
    subject_id: "",
    duration: 1,
    capacity: 10,
  });

  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [warning, setWarning] = useState("");
  const [saving, setSaving] = useState(false);

  // Load venues + subjects
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const [{ data: ven }, { data: subs }] = await Promise.all([
        supabase.from("venues").select("id, name"),
        supabase.from("subjects").select("id, name"),
      ]);
      setVenues((ven || []) as Venue[]);
      setSubjects((subs || []) as Subject[]);
    })();
  }, [isOpen]);

  // Pre-fill when editing
  useEffect(() => {
    if (editingSession) {
      setForm({
        teacher_id: editingSession.teacher?.id || "",
        venue_id: editingSession.venue?.id || "",
        subject_id: editingSession.subject?.id || "",
        duration: 1,
        capacity: editingSession.capacity || 10,
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
        subject_id: "",
        duration: 1,
        capacity: 10,
      });
      setStartDate("");
      setStartHour("00");
      setStartMinute("00");
      setSelectedAvailabilityId(null);
    }
  }, [editingSession]);

  // Availability check
  useEffect(() => {
    if (!startDate) return;
    (async () => {
      const startIso = combineDateTime(startDate, startHour, startMinute);
      const start = new Date(startIso);
      const end = new Date(start);
      end.setHours(start.getHours() + Math.floor(form.duration));
      if (form.duration % 1 !== 0) end.setMinutes(start.getMinutes() + 30);

      const sessionStart = start.toISOString();
      const sessionEnd = end.toISOString();

      const { data, error } = await supabase
        .from("availabilities")
        .select("id, teacher_id, users!availabilities_teacher_id_fkey ( id, name, avatar_url )")
        .eq("status", "available")
        .lte("start_time", sessionEnd)
        .gte("end_time", sessionStart);

      if (error) {
        console.error("❌ Availability check failed:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setAvailableTeachers(
          data
            .filter((a: any) => a.users)
            .map((a: any) => ({
              id: a.users.id,
              name: a.users.name,
              availabilityId: a.id,
              avatarUrl: a.users.avatar_url || null,
            }))
        );
        setWarning("");
      } else {
        setAvailableTeachers([]);
        setWarning("⚠️ No teachers available for this slot.");
      }
    })();
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
        subject_id: form.subject_id || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: form.capacity,
        availability_id: selectedAvailabilityId,
      };

      if (editingSession) {
        const { error } = await supabase.from("sessions").update(payload).eq("id", editingSession.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("sessions").insert([payload]);
        if (error) throw new Error(error.message);
      }

      onSessionAdded();
      onClose();
    } catch (err) {
      if (err instanceof Error) alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;
  const startLabel = startDate && `${startDate} ${startHour}:${startMinute} (${form.duration}h)`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative z-50">
        <h2 className="text-xl font-bold mb-2">
          {editingSession ? "✏️ Edit Session" : "➕ Add Session"}
        </h2>
        {startLabel && <p className="text-sm text-gray-600 mb-4">Start: {startLabel}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date + Time */}
          <Field>
            <Label>Start Time</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
            <div className="flex gap-2 mt-1">
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="border rounded px-2 py-1">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="border rounded px-2 py-1">
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </Field>

          {/* Duration */}
          <Field>
            <Label>Duration</Label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: parseFloat(e.target.value) })}
              className="w-full border rounded px-2 py-1"
            >
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
            </select>
          </Field>

          {/* Teacher */}
          <Field>
            <Label>Teacher</Label>
            <select
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              className="w-full border px-2 py-1 rounded"
            >
              {form.teacher_id === "" && <option value="">— Select Teacher —</option>}
              {availableTeachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {warning && <div className="text-sm text-red-600 mt-1">{warning}</div>}
          </Field>

          {/* Subject */}
          <Field>
            <Label>Subject</Label>
            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">— Select Subject —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </Field>

          {/* Capacity */}
          <Field>
            <Label>Capacity</Label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
              className="w-full border px-2 py-1 rounded"
              min={1}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
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
