import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureUser(email: string, name: string, role: string) {
  const defaultPassword =
    process.env.SEED_DEFAULT_PASSWORD || "Passw0rd!seed123";

  // 1. Try to create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (data?.user) {
    console.log(`👤 Created auth user ${email}`);
    const user = { id: data.user.id, email, name, role };
    await supabase.from("users").upsert(user, { onConflict: "id" });
    return user;
  }

  // 2. If already exists
  if (error?.status === 422 && error.message.includes("already")) {
    console.log(`👤 Reusing existing auth user ${email}`);

    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list.users.find((u) => u.email === email);
    if (!found) throw new Error(`Auth user exists but not found: ${email}`);

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("id", found.id)
      .maybeSingle();

    if (!existing) {
      const newRow = { id: found.id, email, name, role };
      await supabase.from("users").upsert(newRow, { onConflict: "id" });
      return newRow;
    }

    return existing;
  }

  throw error;
}

async function main() {
  console.log("🌱 Seeding sample data...");

  // 1) Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .upsert(
      [
        { name: "Homework Club", description: "General after-school support" },
        { name: "Reading Group", description: "Guided reading practice" },
      ],
      { onConflict: "name" }
    )
    .select();

  console.log("✅ Subjects seeded");

  // 2) Venues
  const venuesToSeed = [
    {
      name: "WeWork Castellana",
      address: "Paseo de la Castellana 77, Madrid",
      capacity: 20,
    },
    {
      name: "WeWork Nuevos Ministerios",
      address: "Calle de Orense 69, Madrid",
      capacity: 25,
    },
    {
      name: "Spaces Atocha",
      address: "Calle de Méndez Álvaro 20, Madrid",
      capacity: 15,
    },
    {
      name: "Impact Hub Prosperidad",
      address: "Calle de Javier Ferrero 10, Madrid",
      capacity: 30,
    },
  ];

  const { data: venues, error: venueError } = await supabase
    .from("venues")
    .upsert(venuesToSeed, { onConflict: "name" })
    .select();

  if (venueError) throw venueError;
  console.log("✅ Venues seeded");

  // 3a) Users (teacher + parent only)
  const teacher = await ensureUser(
    "teacher1@example.com",
    "Mr. Smith",
    "teacher"
  );
  const parent = await ensureUser(
    "parent1@example.com",
    "Jane Parent",
    "parent"
  );

  // 3b) Students (linked to parent)
  const { data: students, error: studentErr } = await supabase
    .from("students")
    .upsert(
      [
        { parent_id: parent.id, name: "Tom Student", age: 10 },
        { parent_id: parent.id, name: "Lucy Student", age: 8 },
      ],
      { onConflict: "id" }
    )
    .select();

  if (studentErr) throw studentErr;
  console.log("✅ Students seeded");

  const student = students?.[0];

  // 4) Sessions
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const { data: sessions, error: sessErr } = await supabase
    .from("sessions")
    .insert([
      {
        subject_id: subjects![0].id,
        teacher_id: teacher.id,
        created_by: teacher.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: 10,
        venue_id: venues![0].id,
      },
    ])
    .select();

  if (sessErr) throw sessErr;
  console.log("✅ Sessions seeded");

  // 5) Bookings (linked to student, not user)
  const { error: bookErr } = await supabase.from("bookings").insert([
    {
      parent_id: parent.id,
      student_id: student.id,
      session_id: sessions![0].id,
      status: "confirmed",
    },
  ]);

  if (bookErr) throw bookErr;
  console.log("✅ Bookings seeded");

  console.log("🎉 Seed complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
