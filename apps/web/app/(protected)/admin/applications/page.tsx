"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/app/components/ui/Table";
import { Badge } from "@/app/components/ui/Badge";

interface ApplicationRow {
  id: string;
  status: string;
  created_at: string;
  teacher: { id: string; name: string } | null;
  session: {
    id: string;
    start_time: string;
    end_time: string;
    subject?: { id: string; name: string } | null;
    venue?: { id: string; name: string } | null;
  } | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadApplications() {
    const { data, error } = await supabase
      .from("session_applications")
      .select(
        `
        id,
        status,
        created_at,
        teacher:users ( id, name ),
        session:sessions (
          id,
          start_time,
          end_time,
          subject:subjects!sessions_subject_id_fkey ( id, name ),
          venue:venues!sessions_venue_id_fkey ( id, name )
        )
      `
      )
      .neq("status", "withdrawn") // hide withdrawn apps
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to load applications:", error.message);
      setApplications([]);
    } else {
      setApplications(data as ApplicationRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  if (loading) return <p>Loading applications...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📥 Session Applications</h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Teacher</TableHeader>
            <TableHeader>Subject</TableHeader>
            <TableHeader>Venue</TableHeader>
            <TableHeader>Start</TableHeader>
            <TableHeader>End</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No applications yet.
              </TableCell>
            </TableRow>
          )}
          {applications.map((app) => (
            <TableRow
              key={app.id}
              className="hover:bg-gray-50"
            >
              <TableCell>{app.teacher?.name ?? "—"}</TableCell>
              <TableCell>{app.session?.subject?.name ?? "—"}</TableCell>
              <TableCell>{app.session?.venue?.name ?? "—"}</TableCell>
              <TableCell>
                {app.session
                  ? new Date(app.session.start_time).toLocaleString("en-GB")
                  : "—"}
              </TableCell>
              <TableCell>
                {app.session
                  ? new Date(app.session.end_time).toLocaleString("en-GB")
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    app.status === "accepted"
                      ? "default"
                      : app.status === "declined"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => router.push(`/admin/applications/${app.id}`)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
