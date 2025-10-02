// scripts/seedSampleData.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function execSQL(sql: string) {
  const { error } = await supabase.rpc("exec_sql", { sql });
  if (error) throw error;
}

async function main(reset = false) {
  if (reset) {
    console.log("♻️ Resetting tables with CASCADE...");
    await execSQL(`
      truncate table bookings cascade;
      truncate table sessions cascade;
      truncate table availabilities cascade;
      truncate table students cascade;
      truncate table venues cascade;
      truncate table subjects cascade;
      truncate table parent_students cascade;
      truncate table users cascade;
    `);
  }

  console.log("🌱 Seeding workflow data...");

  // ✅ Ensure Admin exists
  const adminEmail = "admin@theafternoonacademy.com";
  const { data: existingAdmin, error: adminFetchError } =
    await supabase.auth.admin.listUsers({ email: adminEmail });

  if (adminFetchError) throw adminFetchError;

  let adminId: string;
  if (existingAdmin?.users?.length > 0) {
    adminId = existingAdmin.users[0].id;
    console.log("ℹ️ Admin already exists in auth:", adminId);
  } else {
    const { data: adminAuth, error: adminError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: "Password123!",
        email_confirm: true,
      });
    if (adminError) throw adminError;
    adminId = adminAuth.user.id;
    console.log("✅ Admin created in auth:", adminId);
  }

  const { error: adminUpsertError } = await supabase.from("users").upsert({
    id: adminId,
    email: adminEmail,
    name: "Platform Admin",
    role: "admin",
  });
  if (adminUpsertError) throw adminUpsertError;
  console.log("✅ Admin ready in users table:", adminId);

  // ✅ Ensure Teacher exists
  const teacherEmail = "mattymclauchlan@gmail.com";
  const { data: existingTeacher, error: teacherFetchError } =
    await supabase.auth.admin.listUsers({ email: teacherEmail });

  if (teacherFetchError) throw teacherFetchError;

  let teacherId: string;
  if (existingTeacher?.users?.length > 0) {
    teacherId = existingTeacher.users[0].id;
    console.log("ℹ️ Teacher already exists in auth:", teacherId);
  } else {
    const { data: teacherAuth, error: teacherError } =
      await supabase.auth.admin.createUser({
        email: teacherEmail,
        password: "Password123!",
        email_confirm: true,
      });
    if (teacherError) throw teacherError;
    teacherId = teacherAuth.user.id;
    console.log("✅ Teacher created in auth:", teacherId);
  }

  const { error: teacherUpsertError } = await supabase.from("users").upsert({
    id: teacherId,
    email: teacherEmail,
    name: "Matty McLauchlan",
    role: "teacher",
  });
  if (teacherUpsertError) throw teacherUpsertError;
  console.log("✅ Teacher ready in users table:", teacherId);

  // ✅ Parent seeding
  const parentEmail = "parent1@example.com";
  const { data: existingParent, error: parentFetchError } =
    await supabase.auth.admin.listUsers({ email: parentEmail });

  if (parentFetchError) throw parentFetchError;

  let parentId: string;
  if (existingParent?.users?.length > 0) {
    parentId = existingParent.users[0].id;
    console.log("ℹ️ Parent already exists in auth:", parentId);
  } else {
    const { data: parentAuth, error: parentError } =
      await supabase.auth.admin.createUser({
        email: parentEmail,
        password: "Password123!",
        email_confirm: true,
      });
    if (parentError) throw parentError;
    parentId = parentAuth.user.id;
    console.log("✅ Parent created in auth:", parentId);
  }

  const { error: parentUpsertError } = await supabase.from("users").upsert({
    id: parentId,
    email: parentEmail,
    name: "Parent One",
    role: "parent",
  });
  if (parentUpsertError) throw parentUpsertError;
  console.log("✅ Parent ready in users table:", parentId);

  // ✅ Subjects
  const { data: subj, error: subjError } = await supabase
    .from("subjects")
    .insert([{ name: "Homework Club" }, { name: "Reading Group" }], {
      upsert: true,
    })
    .select("id, name");
  if (subjError) throw subjError;
  console.log("✅ Subjects seeded:", subj.map((s) => s.name));

  // ✅ Venues
  const { data: ven, error: venError } = await supabase
    .from("venues")
    .insert(
      [
        { name: "WeWork Castellana", address: "Paseo de la Castellana, Madrid" },
        { name: "Spaces Atocha", address: "Calle de Atocha, Madrid" },
      ],
      { upsert: true }
    )
    .select("id, name");
  if (venError) throw venError;
  console.log("✅ Venues seeded:", ven.map((v) => v.name));

  // ✅ Students linked to parent
  const { data: students, error: stuError } = await supabase
    .from("students")
    .insert(
      [
        { name: "Tom Student", age: 10, parent_id: parentId },
        { name: "Lucy Student", age: 12, parent_id: parentId },
      ],
      { upsert: true }
    )
    .select("name");
  if (stuError) throw stuError;
  console.log("✅ Students seeded:", students.map((s) => s.name));

  // ✅ Availabilities (only linking teacher, no sessions/bookings)
  const now = new Date();
  const { data: avails, error: availError } = await supabase
    .from("availabilities")
    .insert([
      {
        teacher_id: teacherId,
        start_time: now.toISOString(),
        end_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        status: "available",
      },
    ])
    .select("status");
  if (availError) throw availError;
  console.log("✅ Availabilities seeded:", avails.map((a) => a.status));

  console.log("🎉 Seed complete!");
}

const reset = process.argv.includes("--reset");
main(reset).catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
