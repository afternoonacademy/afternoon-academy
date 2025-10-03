// useSettings.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

export function useSettings<T = any>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) {
        console.error("⚠️ useSettings error:", error.message);
      } else if (data) {
        setValue(data.value as T);
      }
      setLoading(false);
    }
    load();
  }, [key]);

  async function saveSetting(newValue: T) {
    const { error } = await supabase.from("settings").upsert({
      key,
      value: newValue,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Failed to save setting:", error.message);
    } else {
      setValue(newValue);
    }
  }

  return { value, saveSetting, loading };
}
