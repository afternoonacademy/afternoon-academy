import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Server-side Supabase client with SERVICE ROLE key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 👇 Next.js App Router requires this exact export
export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing name or email" },
        { status: 400 }
      );
    }

    const defaultPassword =
      process.env.SEED_DEFAULT_PASSWORD || "TempPass123!";

    // 1️⃣ Create auth user
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      console.error("❌ Auth error:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: "Auth user creation failed" },
        { status: 500 }
      );
    }

    // 2️⃣ Insert into public.users (safe upsert)
const { data, error } = await supabaseAdmin
  .from("users")
  .upsert(
    {
      id: authUser.user.id,
      email,
      name,
      role: "teacher",
    },
    { onConflict: "id" } // 👈 if row already exists, update instead
  )
  .select()
  .single();


    if (error) {
      console.error("❌ DB insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
