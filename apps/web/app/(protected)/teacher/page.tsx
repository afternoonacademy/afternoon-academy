"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@repo/lib/supabase.client";
import { useSessions } from "@repo/hooks/useSessions";
import { useBookings } from "@repo/hooks/useBookings";
import { useAvailabilities } from "@repo/hooks/useAvailabilities";
import useAuthStore from "@repo/store/auth.store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/Table";
import Scheduler from "@repo/scheduler/Scheduler";
import AvailabilityModal from "@/app/components/admin/AvailabilityModal";
import type { SchedulerEvent, Session } from "@repo/types";
import type { Availability } from "@repo/hooks/useAvailabilities";

export default function TeacherPage() {
  const { user } = useAuthStore();
  const { sessions, loading: loadingSessions } = useSessions();
  const { bookings, loading: loadingBookings } = useBookings();
  const { availabilities, loading: loadingAvailabilities, refetch } = useAvailabilities();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);

  // 🔵 Split availabilities into contiguous free blocks (excluding session overlaps)
  const events: SchedulerEvent[] = useMemo(() => {
    if (!user) return [];

    const teacherSessions = sessions.filter((s) => s.teacherId === user.id);

    function splitAvailability(a: any, sessions: Session[]): SchedulerEvent[] {
      const blocks: SchedulerEvent[] = [];
      let cursor = new Date(a.start_time);
      const end = new Date(a.end_time);

      const sortedSessions = [...sessions].sort(
        (s1, s2) => s1.start.getTime() - s2.start.getTime()
      );

      for (const s of sortedSessions) {
        if (s.end <= cursor || s.start >= end) continue;

        if (cursor < s.start) {
          blocks.push({
            id: `avail-${a.id}-${cursor.toISOString()}`,
            availabilityId: a.id,
            teacherId: a.teacher_id!,
            start: new Date(cursor),
            end: new Date(s.start),
            title: "Available",
            status: "available",
            type: "availability",
            subject: null,
            venue: null,
            capacity: null,
          });
        }

        blocks.push({
          id: s.id,
          teacherId: s.teacherId!,
          start: new Date(s.start),
          end: new Date(s.end),
          title: s.title,
          status: sStatusToEnum(s.status),
          type: "session",
          subject: s.subject ?? null,
          venue: s.venue ?? null,
          capacity: s.capacity ?? null,
        });

        cursor = new Date(s.end);
      }

      if (cursor < end) {
        blocks.push({
          id: `avail-${a.id}-${cursor.toISOString()}`,
          availabilityId: a.id,
          teacherId: a.teacher_id!,
          start: new Date(cursor),
          end: new Date(end),
          title: "Available",
          status: "available",
          type: "availability",
          subject: null,
          venue: null,
          capacity: null,
        });
      }

      return blocks;
    }

    return availabilities
      .filter((a) => a.teacher_id === user?.id)
      .flatMap((a) => splitAvailability(a, teacherSessions));
  }, [availabilities, sessions, user]);

  // 🔵 Handlers
  function handleSlotClick(_teacher: any, start: Date, end: Date) {
    if (!user) return;
    setSelectedAvailability({
      id: "",
      teacher_id: user.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "available",
    } as Availability);
    setIsModalOpen(true);
  }

  function handleEventClick(event: SchedulerEvent) {
    if (event.type === "session") {
      alert("⛔ This session is locked. Please contact an admin to make changes.");
      return;
    }
    if (event.type === "availability" && event.availabilityId) {
      const a = availabilities.find((x) => x.id === event.availabilityId) ?? null;
      setSelectedAvailability(a);
      setIsModalOpen(true);
    }
  }

  async function handleSaved() {
    await refetch();
  }

  async function handleDeleted() {
    await refetch();
  }

  return (
    <div className="space-y-8">
      {/* Scheduler */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Your Schedule</h3>
        <div className="w-full overflow-x-auto border rounded bg-white shadow">
          <Scheduler
            teachers={[{ id: user?.id!, name: user?.name ?? "Me" }]}
            events={events}
            singleTeacherMode
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        </div>
      </section>

      {/* Availabilities Table */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Your Availabilities</h3>
        {loadingAvailabilities ? (
          <p>Loading availabilities...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Start</TableHeader>
                  <TableHeader>End</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {availabilities
                  .filter((a) => a.teacher_id === user?.id)
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{new Date(a.start_time).toLocaleString("en-GB")}</TableCell>
                      <TableCell>{new Date(a.end_time).toLocaleString("en-GB")}</TableCell>
                      <TableCell>{a.status}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Sessions Table */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Your Sessions</h3>
        {loadingSessions ? (
          <p>Loading sessions...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Subject</TableHeader>
                  <TableHeader>Venue</TableHeader>
                  <TableHeader>Start</TableHeader>
                  <TableHeader>End</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Capacity</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.subject ?? "—"}</TableCell>
                    <TableCell>{s.venue ?? "—"}</TableCell>
                    <TableCell>{s.start ? s.start.toLocaleString("en-GB") : "—"}</TableCell>
                    <TableCell>{s.end ? s.end.toLocaleString("en-GB") : "—"}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Bookings Table */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
        {loadingBookings ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Parent</TableHeader>
                  <TableHeader>Student</TableHeader>
                  <TableHeader>Subject</TableHeader>
                  <TableHeader>Start</TableHeader>
                  <TableHeader>End</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.parent?.name ?? "—"}</TableCell>
                    <TableCell>{b.student?.name ?? "—"}</TableCell>
                    <TableCell>{b.session?.subject ?? "—"}</TableCell>
                    <TableCell>
                      {b.session?.start_time ? new Date(b.session.start_time).toLocaleString("en-GB") : "—"}
                    </TableCell>
                    <TableCell>
                      {b.session?.end_time ? new Date(b.session.end_time).toLocaleString("en-GB") : "—"}
                    </TableCell>
                    <TableCell>{b.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availability={selectedAvailability}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

// 🔧 status normalizer
function sStatusToEnum(status: string): SchedulerEvent["status"] {
  if (status === "bookable") return "bookable";
  if (status === "booked") return "booked";
  if (status === "cancelled") return "cancelled";
  if (status === "unassigned") return "unassigned";
  return "available";
}
