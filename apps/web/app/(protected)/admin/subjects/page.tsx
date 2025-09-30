"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/Table";
import { SubjectModal } from "@/app/components/admin/SubjectModal";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSubjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to load subjects:", error.message);
    } else {
      setSubjects(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  if (loading) return <p>Loading subjects...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📚 Subjects</h2>
        <SubjectModal onSaved={loadSubjects} />
      </div>

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
          {subjects.map((subj) => (
            <TableRow key={subj.id}>
              <TableCell>{subj.name}</TableCell>
              <TableCell className="text-zinc-500">
                {subj.description ?? "—"}
              </TableCell>
              <TableCell className="text-zinc-500">
                {new Date(subj.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-2">
                <SubjectModal subject={subj} onSaved={loadSubjects} />
                <button
                  onClick={() => handleDelete(subj.id, loadSubjects)}
                  className="text-red-600 hover:underline text-sm"
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

// Helper delete fn
async function handleDelete(id: string, onDeleted: () => void) {
  if (!confirm("Are you sure you want to delete this subject?")) return;
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) {
    alert("❌ Failed to delete: " + error.message);
  } else {
    onDeleted();
  }
}
