"use client";
import { supabase } from "@repo/lib/supabase.client";
import { useState, useMemo } from "react";
import Scheduler from "@repo/scheduler/Scheduler";
import { useAvailabilities } from "@repo/hooks/useAvailabilities";
import { useSessions } from "@repo/hooks/useSessions";
import { useUsers } from "@repo/hooks/useUsers";
import AvailabilityModal from "@/app/components/admin/AvailabilityModal";
import SessionModal from "@/app/components/admin/SessionModal";
import type { SchedulerEvent, Teacher } from "@repo/types";
import type { Availability } from "@repo/hooks/useAvailabilities";

export default function AvailabilityPage() {
  const {
    availabilities,
    loading: loadingAvail,
    addOrUpdateAvailability,
    removeAvailability,
  } = useAvailabilities();
  const { sessions } = useSessions();
  const { users, loading: loadingUsers } = useUsers();

  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [editingSession, setEditingSession] = useState<any | null>(null);

  // Teachers
  const teachers: Teacher[] = useMemo(
    () =>
      users
        .filter((u) => u.role === "teacher")
        .map((u) => ({ id: u.id, name: u.name ?? "Unnamed" })),
    [users]
  );

  // Merge events
  const events: SchedulerEvent[] = useMemo(() => {
    const availabilityEvents: SchedulerEvent[] = availabilities.map((a) => ({
      id: `avail-${a.id}`,
      availabilityId: a.id,
      teacherId: a.teacher_id ?? "",
      start: new Date(a.start_time),
      end: new Date(a.end_time),
      title: "Available",
      status: a.status === "consumed" ? "unassigned" : "available",
      type: "availability",
      subject: null,
      venue: null,
      capacity: null,
    }));

    const sessionEvents: SchedulerEvent[] = sessions.map((s) => ({
      id: s.id,
      teacherId: s.teacherId ?? "",
      start: new Date(s.start),
      end: new Date(s.end),
      title: s.title,
      status: sStatusToEnum(s.status),
      type: "session",
      subject: s.subject ?? null,
      venue: s.venue ?? null,
      capacity: s.capacity ?? null,
    }));

    return [...availabilityEvents, ...sessionEvents];
  }, [availabilities, sessions]);

  // Handlers
  function handleSlotClick(teacher: Teacher, start: Date, end: Date) {
    setEditingAvailability({
      id: "",
      teacher_id: teacher.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "available",
    } as Availability);
    setAvailabilityModalOpen(true);
  }

  async function handleEventClick(event: SchedulerEvent) {
  if (event.type === "availability" && event.availabilityId) {
    const a = availabilities.find((x) => x.id === event.availabilityId) ?? null;
    setEditingAvailability(a);
    setAvailabilityModalOpen(true);
  } else if (event.type === "session") {
    // 🔑 Fetch full session with related teacher, subject, venue
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        id,
        start_time,
        end_time,
        status,
        capacity,
        subject:subjects!sessions_subject_id_fkey ( id, name ),
        teacher:users!sessions_teacher_fkey ( id, name ),
        venue:venues!sessions_venue_id_fkey ( id, name )
      `
      )
      .eq("id", event.id)
      .single();

    if (error) {
      console.error("❌ Failed to load session for editing:", error.message);
      return;
    }

    setEditingSession(data);
    setSessionModalOpen(true);
  }
}

  if (loadingAvail || loadingUsers) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📅 Teacher Availabilities</h2>

      <div className="w-full overflow-x-auto border rounded bg-white shadow">
        <Scheduler
          teachers={teachers}
          events={events}
          startHour={8}
          endHour={20}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        availability={editingAvailability}
        onSaved={(a) => addOrUpdateAvailability(a)}
        onDeleted={(id) => removeAvailability(id)}
      />

      {/* Session Modal */}
      <SessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSessionAdded={() => {
          // trigger refetch if needed
        }}
        editingSession={editingSession}
      />
    </div>
  );
}

function sStatusToEnum(status: string): SchedulerEvent["status"] {
  if (status === "bookable") return "bookable";
  if (status === "booked") return "booked";
  if (status === "cancelled") return "cancelled";
  if (status === "unassigned") return "unassigned";
  return "available";
}
