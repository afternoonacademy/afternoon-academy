"use client";

import { useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import { useSubjects } from "@repo/hooks";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/Table";

export function SubjectsTable() {
  const { subjects, loading, error, setSubjects } = useSubjects();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  if (loading) return <p>Loading subjects...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // Add subject
  async function handleAdd() {
    if (!newName) return;
    const { data, error } = await supabase
      .from("subjects")
      .insert({ name: newName, description: newDesc })
      .select()
      .single();

    if (error) {
      alert("❌ Failed to add subject: " + error.message);
    } else {
      setSubjects((prev) => [data, ...prev]);
      setNewName("");
      setNewDesc("");
    }
  }

  // Delete subject
  async function handleDelete(id: string) {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) {
      alert("❌ Failed to delete: " + error.message);
    } else {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new subject form */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Subject name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Created</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.description ?? "—"}</TableCell>
              <TableCell>
                {s.created_at
                  ? new Date(s.created_at).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
