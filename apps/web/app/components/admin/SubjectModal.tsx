"use client";

import { useState, useEffect } from "react";
import { supabase } from "@repo/lib/supabase.client";

interface Subject {
  id?: string;
  name: string;
  description?: string | null;
}

export function SubjectModal({
  onSaved,
  subject,
}: {
  onSaved: () => void;
  subject?: Subject | null;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setDescription(subject.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [subject]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      if (subject?.id) {
        // ✏️ Update
        const { error } = await supabase
          .from("subjects")
          .update({ name, description })
          .eq("id", subject.id);
        if (error) throw error;
      } else {
        // ➕ Insert
        const { error } = await supabase
          .from("subjects")
          .insert([{ name, description }]);
        if (error) throw error;
      }

      setOpen(false);
      onSaved();
    } catch (err: any) {
      alert("❌ Failed to save subject: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {subject ? (
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
          ➕ Add Subject
        </button>
      )}

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {subject ? "Edit Subject" : "Add Subject"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Subject name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded"
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
