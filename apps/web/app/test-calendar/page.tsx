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
  const [view, setView] = useState<"day" | "week">("day");

  if (loadingAvail || loadingUsers) return <p>Loading…</p>;

  const teachers: Teacher[] = users
    .filter((u) => u.role === "teacher")
    .map((u) => ({ id: u.id, name: u.name ?? "Unnamed" }));

  const events: SchedulerEvent[] = availabilities.map((a) => ({
    id: a.id,
    teacherId: a.teacher_id ?? "",
    start: new Date(a.start_time),
    end: new Date(a.end_time),
    title: a.status,
    status: (a.status as "open" | "booked" | "cancelled") ?? "open",
  }));

  function handleSlotClick(teacher: Teacher, start: Date, end: Date) {
    setSelectedAvailability({
      id: "",
      teacher_id: teacher.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "open",
      // @ts-expect-error compat
      subject_id: null,
    });
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Scheduler Test</h1>

        {/* 🔵 Only toggle buttons here */}
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              view === "day" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("day")}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 rounded ${
              view === "week" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("week")}
          >
            Week
          </button>
        </div>
      </div>

      <Scheduler
        teachers={teachers}
        events={events}
        startHour={8}
        endHour={20}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
        view={view} // ✅ pass view down
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
