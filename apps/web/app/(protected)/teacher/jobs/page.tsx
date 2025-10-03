"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/app/components/ui/Table";
import { Badge } from "@/app/components/ui/Badge";
import useAuthStore from "@repo/store/auth.store";

interface SessionRow {
  id: string;
  start_time: string;
  end_time: string;
  subject?: { id: string; name: string } | null;
  venue?: { id: string; name: string } | null;
  applications?: { status: string }[];
}

export default function AvailableSessionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSessions() {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        id,
        start_time,
        end_time,
        subject:subjects!sessions_subject_id_fkey ( id, name ),
        venue:venues!sessions_venue_id_fkey ( id, name ),
        applications:session_applications ( status, teacher_id )
      `
      )
      .eq("status", "unassigned")
      .gte("start_time", new Date().toISOString())
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

  if (loading) return <p>Loading available sessions...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📌 Available Sessions</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Subject</TableHeader>
            <TableHeader>Venue</TableHeader>
            <TableHeader>Start</TableHeader>
            <TableHeader>End</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No available sessions right now.
              </TableCell>
            </TableRow>
          )}
          {sessions.map((s) => {
            const applied = s.applications?.some(
              (a) => a.teacher_id === user?.id && a.status === "applied"
            );

            return (
              <TableRow
                key={s.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/teacher/jobs/${s.id}`)}
              >
                <TableCell>{s.subject?.name ?? "—"}</TableCell>
                <TableCell>{s.venue?.name ?? "—"}</TableCell>
                <TableCell>{new Date(s.start_time).toLocaleString("en-GB")}</TableCell>
                <TableCell>{new Date(s.end_time).toLocaleString("en-GB")}</TableCell>
                <TableCell>
                  {applied ? (
                    <Badge variant="default">Applied</Badge>
                  ) : (
                    <Badge variant="outline">Open</Badge>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => router.push(`/teacher/jobs/${s.id}`)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {applied ? "View" : "Apply"}
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
