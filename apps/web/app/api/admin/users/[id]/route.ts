// apps/web/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    console.log("🗑️ Deleting user:", userId);

    // 1. Delete from Auth (auth.users)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error("❌ Failed to delete from auth.users:", authErr);
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // 2. Delete from public.users
    const { error: dbErr } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbErr) {
      console.error("❌ Failed to delete from public.users:", dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Unexpected delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
