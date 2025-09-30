import "dotenv/config"; 
import { ensureUserInDb } from "../packages/lib/ensureUserInDb";
import { supabase } from "../packages/lib/supabase.client";

async function runTests() {
  console.log("🧪 Running ensureUserInDb tests...");

  const fakeParent = {
    id: crypto.randomUUID(),
    email: "testparent@example.com",
    user_metadata: { name: "Test Parent" },
  };

  const parentResult = await ensureUserInDb(fakeParent);
  console.log("✅ Parent created:", parentResult);

  const fakeAdmin = {
    id: crypto.randomUUID(),
    email: "admin@afternoonacademy.com",
    user_metadata: { name: "Super Admin" },
  };

  const adminResult = await ensureUserInDb(fakeAdmin);
  console.log("✅ Admin created:", adminResult);

  const fakeTeacher = {
    id: crypto.randomUUID(),
    email: "teacher1@example.com",
    user_metadata: { name: "Mr. Teacher" },
  };

  const teacherResult = await ensureUserInDb(fakeTeacher, "teacher");
  console.log("✅ Teacher created:", teacherResult);

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, role, name")
    .in("id", [fakeParent.id, fakeAdmin.id, fakeTeacher.id]);

  if (error) {
    console.error("❌ Failed fetching users:", error.message);
  } else {
    console.log("📊 Users in DB:", users);
  }

  console.log("🎉 Tests complete!");
}

runTests().catch((err) => {
  console.error("❌ Test run failed:", err);
});
