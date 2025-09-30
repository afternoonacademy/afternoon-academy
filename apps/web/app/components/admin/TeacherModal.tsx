"use client";

import { useState, useEffect } from "react";

export function TeacherModal({
  onSaved,
  teacher,
}: {
  onSaved: () => void;
  teacher?: { id: string; name: string; email: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name);
      setEmail(teacher.email);
    } else {
      setName("");
      setEmail("");
    }
  }, [teacher]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;

    setSaving(true);
    try {
      if (teacher?.id) {
        // ✏️ Update teacher in users table
        const res = await fetch(`/api/admin/users/${teacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        const { error } = await res.json();
        if (error) throw new Error(error);
      } else {
        // ➕ Create new teacher
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        const { error } = await res.json();
        if (error) throw new Error(error);
      }

      setOpen(false);
      onSaved();
    } catch (err: any) {
      alert("❌ Failed to save teacher: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {teacher ? (
        <button
          onClick={() => setOpen(true)}
          className="text-blue-600 hover:underline text-sm"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ➕ Add Teacher
        </button>
      )}

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {teacher ? "Edit Teacher" : "Add Teacher"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
