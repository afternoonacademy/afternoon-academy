import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

export interface Subject {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, description, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Failed to load subjects:", error.message);
        setError(error.message);
      } else {
        setSubjects(data || []);
      }
      setLoading(false);
    }

    load();
  }, []);

  return { subjects, loading, error, setSubjects };
}
