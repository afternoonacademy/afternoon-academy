"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";
import { Badge } from "@/app/components/ui/Badge";

interface VenueDetail {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  photo_url?: string | null;
}

interface SessionDetail {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  capacity: number;
  subject?: { id: string; name: string } | null;
  venue?: VenueDetail | null;
}

export default function AvailableSessionDetailPage() {
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id || !user?.id) return;

      const { data: sessionData } = await supabase
        .from("sessions")
        .select(
          `
          id,
          start_time,
          end_time,
          status,
          capacity,
          subject:subjects!sessions_subject_id_fkey ( id, name ),
          venue:venues!sessions_venue_id_fkey (
            id,
            name,
            address,
            city,
            postcode,
            latitude,
            longitude,
            description,
            photo_url
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      const { data: appData } = await supabase
        .from("session_applications")
        .select("*")
        .eq("session_id", id)
        .eq("teacher_id", user.id)
        .maybeSingle();

      setSession(sessionData);
      setApplication(appData);
      setLoading(false);
    }
    load();
  }, [id, user?.id]);

  async function handleApply() {
    if (!user?.id) return;
    const { error } = await supabase
      .from("session_applications")
      .upsert(
        { session_id: id, teacher_id: user.id, status: "applied" },
        { onConflict: ["session_id", "teacher_id"] }
      );
    if (!error) setApplication({ session_id: id, teacher_id: user.id, status: "applied" });
  }

  async function handleWithdraw() {
    if (!user?.id) return;
    const { error } = await supabase
      .from("session_applications")
      .delete()
      .eq("session_id", id)
      .eq("teacher_id", user.id);
    if (!error) setApplication(null);
  }

  if (loading) return <p>Loading session...</p>;
  if (!session) return <p>❌ Session not found</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📖 Session Details</h2>

      <div className="flex gap-4 items-center">
        <Badge variant="outline">{session.status}</Badge>
        <span>Capacity: {session.capacity}</span>
      </div>

      <p>
        <b>Start:</b> {new Date(session.start_time).toLocaleString("en-GB")}
      </p>
      <p>
        <b>End:</b> {new Date(session.end_time).toLocaleString("en-GB")}
      </p>

      {/* Subject Section */}
      {session.subject ? (
        <details className="border rounded p-3">
          <summary className="cursor-pointer font-semibold">📚 Subject Info</summary>
          <p><b>Name:</b> {session.subject.name}</p>
        </details>
      ) : (
        <div className="border rounded p-3 text-gray-500 italic">
          📚 Subject will be updated soon
        </div>
      )}

      {/* Venue Section */}
      {session.venue ? (
        <details className="border rounded p-3">
          <summary className="cursor-pointer font-semibold">🏢 Venue Info</summary>
          <p><b>Name:</b> {session.venue.name}</p>
          <p>
            <b>Address:</b> {session.venue.address ?? "—"}{" "}
            {session.venue.city ?? ""} {session.venue.postcode ?? ""}
          </p>
          <p><b>Description:</b> {session.venue.description ?? "—"}</p>

          {session.venue.photo_url && (
            <img
              src={session.venue.photo_url}
              alt={session.venue.name}
              className="w-full max-w-md rounded-lg shadow mt-2"
            />
          )}
        </details>
      ) : (
        <div className="border rounded p-3 text-gray-500 italic">
          🏢 Venue details coming soon
        </div>
      )}

      {/* Actions */}
      {application ? (
        <div className="flex gap-2">
          <button
            disabled
            className="px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed"
          >
            ✅ Applied
          </button>
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Withdraw
          </button>
        </div>
      ) : (
        <button
          onClick={handleApply}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Apply
        </button>
      )}

      <button
        onClick={() => router.back()}
        className="block mt-4 text-sm text-gray-600 underline"
      >
        ← Back to Available Sessions
      </button>
    </div>
  );
}
