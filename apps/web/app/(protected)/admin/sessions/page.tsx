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
import SessionModal from "@/app/components/admin/SessionModal";

interface SessionRow {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  capacity: number;
  subject?: { id: string; name: string } | null;
  teacher?: { id: string; name: string } | null;
  venue?: { id: string; name: string } | null;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionRow | null>(null);

  async function loadSessions() {
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
      .order("start_time", { ascending: true });

    if (error) {
      console.error("❌ Failed to load sessions:", error.message);
      setSessions([]);
    } else {
      setSessions(data as SessionRow[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this session?")) return;
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (!error) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  }

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📅 Sessions</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Session
        </button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Subject</TableHeader>
            <TableHeader>Teacher</TableHeader>
            <TableHeader>Venue</TableHeader>
            <TableHeader>Start</TableHeader>
            <TableHeader>End</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Capacity</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.subject?.name ?? "—"}</TableCell>
              <TableCell>{s.teacher?.name ?? "Unassigned"}</TableCell>
              <TableCell>{s.venue?.name ?? "—"}</TableCell>
              <TableCell>
                {new Date(s.start_time).toLocaleString("en-GB")}
              </TableCell>
              <TableCell>
                {new Date(s.end_time).toLocaleString("en-GB")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    s.status === "scheduled"
                      ? "default"
                      : s.status === "cancelled"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell>{s.capacity}</TableCell>
              <TableCell className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingSession(s);
                    setIsModalOpen(true);
                  }}
                  className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️ Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
        }}
        onSessionAdded={loadSessions}
        editingSession={editingSession}
      />
    </div>
  );
}
