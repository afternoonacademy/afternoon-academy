"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/Table";
import { Badge } from "@/app/components/ui/Badge";
import BookingModal from "@/app/components/admin/BookingModal";

interface Booking {
  id: string;
  status: string;
  created_at: string;
  sessions: {
    start_time: string;
    end_time: string;
    subjects: { name: string };
  };
  parent: { name: string; email: string };
  student: { name: string; age: number };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        created_at,
        sessions (
          start_time,
          end_time,
          subjects ( name )
        ),
        parent:users!bookings_parent_id_fkey ( name, email ),
        student:students ( name, age )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to load bookings:", error.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📑 Bookings</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Booking
        </button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Parent</TableHeader>
            <TableHeader>Student</TableHeader>
            <TableHeader>Session</TableHeader>
            <TableHeader>Start</TableHeader>
            <TableHeader>End</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              {/* Parent */}
              <TableCell>
                {b.parent?.name} <br />
                <span className="text-xs text-gray-500">{b.parent?.email}</span>
              </TableCell>

              {/* Student */}
              <TableCell>
                {b.student?.name ?? "—"}
                {b.student?.age && (
                  <span className="ml-1 text-xs text-gray-500">
                    (Age {b.student.age})
                  </span>
                )}
              </TableCell>

              {/* Session */}
              <TableCell>{b.sessions?.subjects?.name ?? "—"}</TableCell>
              <TableCell>
                {b.sessions?.start_time
                  ? new Date(b.sessions.start_time).toLocaleString("en-GB")
                  : "—"}
              </TableCell>
              <TableCell>
                {b.sessions?.end_time
                  ? new Date(b.sessions.end_time).toLocaleString("en-GB")
                  : "—"}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant={
                    b.status === "confirmed"
                      ? "default"
                      : b.status === "cancelled"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {b.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingAdded={loadBookings}
      />
    </div>
  );
}
