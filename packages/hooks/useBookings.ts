"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import { Booking } from "@repo/types";
import useAuthStore from "@repo/store/auth.store";

export function useBookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;

      let query = supabase
        .from("bookings")
        .select(
          `
          id,
          status,
          created_at,
          parent:users!bookings_parent_id_fkey(id, name, email),
          student:students!bookings_student_id_fkey(id, name, age),
          session:sessions!inner(
            id,
            start_time,
            end_time,
            teacher_id,
            subject:subjects!sessions_subject_id_fkey(id, name),
            venue:venues(id, name)
          )
        `
        );

      if (user.role === "teacher") {
        // ✅ filter must be on the actual table
        query = query.eq("sessions.teacher_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ [useBookings] Error:", JSON.stringify(error, null, 2));
        setBookings([]);
      } else {
        console.log("✅ [useBookings] Final Data:", data);
        setBookings(data as Booking[]);
      }

      setLoading(false);
    }

    fetchBookings();
  }, [user]);

  return { bookings, loading };
}
