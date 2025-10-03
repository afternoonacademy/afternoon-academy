import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Service role client (needs SERVICE_ROLE_KEY + URL in secrets)
const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!
);

console.info("✅ Seed Test Session function ready");

Deno.serve(async (_req) => {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          id: crypto.randomUUID(),
          start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          end_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),   // 1 hour ago
          status: "unassigned",
          capacity: 10,
        },
      ])
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        inserted: data,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
