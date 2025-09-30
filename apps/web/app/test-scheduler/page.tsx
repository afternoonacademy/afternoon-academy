"use client";

import { useState } from "react";
import Scheduler from "@repo/scheduler/Scheduler";
import { useAvailabilities } from "@repo/hooks/useAvailabilities";
import { useUsers } from "@repo/hooks/useUsers";
import AvailabilityModal from "@/app/components/admin/AvailabilityModal";
import type { SchedulerEvent, Teacher } from "@repo/scheduler/types";
import type { Availability } from "@repo/hooks/useAvailabilities";

export default function TestSchedulerPage() {
  const { availabilities, loading: loadingAvail, refetch } = useAvailabilities();
  const { users, loading: loadingUsers } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] =
    useState<Availability | null>(null);

  if (loadingAvail || loadingUsers) return <p>Loading…</p>;

  // Teachers
  const teachers: Teacher[] = users
    .filter((u) => u.role === "teacher")
    .map((u) => ({ id: u.id, name: u.name ?? "Unnamed" }));

  // Events
  const events: SchedulerEvent[] = availabilities.map((a) => ({
    id: a.id,
    teacherId: a.teacher_id ?? "",
    start: new Date(a.start_time),
    end: new Date(a.end_time),
    title: a.status,
    status: (a.status as "open" | "booked" | "cancelled") ?? "open",
  }));

  // Handlers
  function handleSlotClick(teacher: Teacher, start: Date, end: Date) {
    setSelectedAvailability({
      id: "",
      teacher_id: teacher.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "open",
    } as Availability);
    setIsModalOpen(true);
  }

  function handleEventClick(event: SchedulerEvent) {
    const a = availabilities.find((x) => x.id === event.id) ?? null;
    setSelectedAvailability(a);
    setIsModalOpen(true);
  }

  async function handleSaved() {
    await refetch();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Scheduler Test</h1>

      <Scheduler
        teachers={teachers}
        events={events}
        startHour={8}
        endHour={20}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
      />

      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availability={selectedAvailability}
        onSaved={handleSaved}
      />
    </div>
  );
}
