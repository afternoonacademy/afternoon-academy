"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@repo/lib/supabase.client";
import type { AvailabilityStatus } from "@repo/types";

export interface Availability {
  id: string;
  teacher_id: string | null;
  start_time: string;
  end_time: string;
  status: AvailabilityStatus;  // ✅ now typed properly
}

export function useAvailabilities() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailabilities = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("availabilities")
      .select("id, teacher_id, start_time, end_time, status")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("❌ Failed to load availabilities:", error.message);
      setError(error.message);
      setLoading(false);
      return;
    }

    setAvailabilities((data || []) as Availability[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  // ✅ Optimistic mutation helpers
  const addOrUpdateAvailability = (availability: Availability) => {
    setAvailabilities((prev) => {
      const exists = prev.find((a) => a.id === availability.id);
      if (exists) {
        return prev.map((a) => (a.id === availability.id ? availability : a));
      }
      return [...prev, availability];
    });
  };

  const removeAvailability = (id: string) => {
    setAvailabilities((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    availabilities,
    loading,
    error,
    refetch: fetchAvailabilities,
    addOrUpdateAvailability,
    removeAvailability,
  };
}
