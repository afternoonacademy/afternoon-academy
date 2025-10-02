"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

export interface AvailabilityRequest {
  id: string;
  teacher_id: string;
  session_id: string;
  requested_by: string | null;
  requested_start_time: string;
  requested_end_time: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function useAvailabilityRequests(teacherId: string | null) {
  const [requests, setRequests] = useState<AvailabilityRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;

    async function fetchRequests() {
      setLoading(true);
      const { data, error } = await supabase
        .from("availability_requests")
        .select(
          `
          id,
          teacher_id,
          session_id,
          requested_by,
          requested_start_time,
          requested_end_time,
          status,
          created_at,
          users!availability_requests_requested_by_fkey ( id, name, email )
        `
        )
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (!error && data) setRequests(data as any);
      setLoading(false);
    }

    fetchRequests();
  }, [teacherId]);

  async function updateRequest(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("availability_requests")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return { requests, loading, updateRequest };
}
