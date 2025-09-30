"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@repo/lib/supabase.client";

export interface Availability {
  id: string;
  teacher_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
}

export function useAvailabilities() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailabilities = useCallback(async () => {
    console.log("🔄 [useAvailabilities] Fetching from DB…");
    setLoading(true);

    const { data, error } = await supabase
      .from("availabilities")
      .select("id, teacher_id, start_time, end_time, status")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("❌ Failed to load availabilities:", error.message);
      setError(error.message);
    } else {
      console.log("✅ [useAvailabilities] Loaded", data);
      setAvailabilities(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  return { availabilities, loading, error, refetch: fetchAvailabilities };
}
