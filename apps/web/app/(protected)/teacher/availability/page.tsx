"use client";

import { useState, useMemo, useEffect } from "react";
import Scheduler from "@repo/scheduler/Scheduler";
import { supabase } from "@repo/lib/supabase.client";
import AvailabilityModal from "@/app/components/admin/AvailabilityModal";
import type { SchedulerEvent, Teacher } from "@repo/types";
import useAuthStore from "@repo/store/auth.store";

interface Availability {
  id: string;
  teacher_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
}

interface SessionRow {
  id: string;
  teacher_id: string;
  start: string;
  end: string;
  title: string;
  status: string;
  subject?: string | null;
  venue?: string | null;
  capacity?: number | null;
}

export default function TeacherAvailabilityPage() {
  const { user } = useAuthStore();

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);

  // Only the current teacher
  const teachers: Teacher[] = user ? [{ id: user.id, name: user.name || "You" }] : [];

  // Load teacher’s availabilities + sessions
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);

      // Availabilities
      const { data: availData } = await supabase
        .from("availabilities")
        .select("id, teacher_id, start_time, end_time, status")
        .eq("teacher_id", user.id);

      setAvailabilities(availData || []);

      // Sessions
      const { data: sessData } = await supabase
        .from("sessions")
        .select("id, teacher_id, start, end, title, status, subject, venue, capacity")
        .eq("teacher_id", user.id);

      setSessions((sessData as SessionRow[]) || []);
      setLoading(false);
    }

    loadData();
  }, [user]);

  // Merge into SchedulerEvents
  const events: SchedulerEvent[] = useMemo(() => {
    const availabilityEvents: SchedulerEvent[] = availabilities.map((a) => ({
      id: `avail-${a.id}`,
      availabilityId: a.id,
      teacherId: a.teacher_id ?? "",
      start: new Date(a.start_time),
      end: new Date(a.end_time),
      title: "Available",
      status: "available",
      type: "availability",
    }));

    const sessionEvents: SchedulerEvent[] = sessions.map((s) => ({
      id: s.id,
      teacherId: s.teacher_id ?? "",
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
  function handleSlotClick(_teacher: Teacher, start: Date, end: Date) {
    setSelectedAvailability({
      id: "",
      teacher_id: user?.id || "",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "available",
    });
    setIsModalOpen(true);
  }

  function handleEventClick(event: SchedulerEvent) {
    if (event.type === "availability" && event.availabilityId) {
      const a = availabilities.find((x) => x.id === event.availabilityId) ?? null;
      setSelectedAvailability(a);
      setIsModalOpen(true);
    }

    if (event.type === "session") {
      // Teachers can’t delete sessions
      alert("This is a scheduled session. Please contact admin to make changes.");
    }
  }

  // Optimistic update helpers
  function addOrUpdateAvailability(a: Availability) {
    setAvailabilities((prev) => {
      const exists = prev.find((x) => x.id === a.id);
      if (exists) {
        return prev.map((x) => (x.id === a.id ? a : x));
      }
      return [...prev, a];
    });
  }

  function removeAvailability(id: string) {
    setAvailabilities((prev) => prev.filter((a) => a.id !== id));
  }

  if (!user) return <p>Loading user...</p>;
  if (loading) return <p>Loading your availabilities…</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📅 My Availability</h2>
      <p className="text-gray-600">
        Click on empty slots to add availability. Click on an availability to edit or delete it.
        You can view sessions here, but only admins can cancel them.
      </p>

      <Scheduler
        teachers={teachers}
        events={events}
        startHour={8}
        endHour={20}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
        singleTeacherMode={true}
      />

      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availability={selectedAvailability}
        onSaved={(a) => addOrUpdateAvailability(a)}
        onDeleted={(id) => removeAvailability(id)}
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
