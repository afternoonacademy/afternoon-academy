"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import { SchedulerEvent } from "@repo/types";
import useAuthStore from "@repo/store/auth.store";

export function useSessions() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SchedulerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;

      let query = supabase
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

      if (user.role === "teacher") {
        query = query.eq("teacher_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Failed to load sessions:", error.message);
        setError(error);
        setSessions([]);
        setLoading(false);
        return;
      }

      const mapped: SchedulerEvent[] = (data || []).map((s: any) => {
        let normalized: "unassigned" | "bookable" | "booked" | "cancelled";

        if (!s.teacher?.id) normalized = "unassigned"; // blue
        else if (s.status === "booked") normalized = "booked"; // black
        else if (s.status === "cancelled") normalized = "cancelled"; // grey
        else normalized = "bookable"; // green

        return {
          id: s.id,
          teacherId: s.teacher?.id ?? null,
          start: new Date(s.start_time),
          end: new Date(s.end_time),
          title: s.subject?.name || "Session",
          status: normalized,
          subject: s.subject?.name || null,
          venue: s.venue?.name || null,
          type: "session",
          capacity: s.capacity,
        };
      });

      console.log("✅ [useSessions] Normalized", mapped);
      setSessions(mapped);
      setLoading(false);
    }

    fetchSessions();
  }, [user]);

  return { sessions, loading, error };
}
