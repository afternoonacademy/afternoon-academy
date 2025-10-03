"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import { Badge } from "@/app/components/ui/Badge";

interface ApplicationDetail {
  id: string;
  status: string;
  created_at: string;
  teacher: { id: string; name: string; email?: string } | null;
  session: {
    id: string;
    start_time: string;
    end_time: string;
    subject?: { id: string; name: string } | null;
    venue?: { id: string; name: string; address?: string | null } | null;
  } | null;
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadApp() {
    const { data, error } = await supabase
      .from("session_applications")
      .select(
        `
        id,
        status,
        created_at,
        teacher:users ( id, name, email ),
        session:sessions (
          id,
          start_time,
          end_time,
          subject:subjects!sessions_subject_id_fkey ( id, name ),
          venue:venues!sessions_venue_id_fkey ( id, name, address )
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (!error) setApp(data);
    setLoading(false);
  }

  async function handleDecision(decision: "accepted" | "declined") {
    if (!app) return;

    const { error } = await supabase
      .from("session_applications")
      .update({ status: decision })
      .eq("id", app.id);

    if (error) return alert("❌ Failed: " + error.message);

    if (decision === "accepted" && app.teacher && app.session) {
      await supabase.from("sessions").update({
        teacher_id: app.teacher.id,
        status: "bookable",
      }).eq("id", app.session.id);

      await supabase.from("session_applications")
        .update({ status: "declined" })
        .eq("session_id", app.session.id)
        .neq("id", app.id);
    }

    alert(`✅ Application ${decision}`);
    router.push("/admin/applications");
  }

  useEffect(() => {
    loadApp();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!app) return <p>❌ Application not found</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Application Details</h2>
      <Badge>{app.status}</Badge>

      <h3 className="font-semibold">Teacher</h3>
      <p><b>Name:</b> {app.teacher?.name ?? "—"}</p>
      <p><b>Email:</b> {app.teacher?.email ?? "—"}</p>

      <h3 className="font-semibold mt-4">Session</h3>
      <p><b>Subject:</b> {app.session?.subject?.name ?? "—"}</p>
      <p><b>Venue:</b> {app.session?.venue?.name ?? "—"}</p>
      <p><b>Address:</b> {app.session?.venue?.address ?? "—"}</p>
      <p><b>Start:</b> {app.session ? new Date(app.session.start_time).toLocaleString("en-GB") : "—"}</p>
      <p><b>End:</b> {app.session ? new Date(app.session.end_time).toLocaleString("en-GB") : "—"}</p>

      {app.status === "applied" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleDecision("accepted")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ✅ Accept
          </button>
          <button
            onClick={() => handleDecision("declined")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ❌ Decline
          </button>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="mt-4 text-sm underline text-gray-600"
      >
        ← Back
      </button>
    </div>
  );
}
