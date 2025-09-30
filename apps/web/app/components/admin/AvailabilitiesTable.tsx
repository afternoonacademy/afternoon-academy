"use client";

import { supabase } from "@repo/lib/supabase.client";
import { useAvailabilities } from "@repo/hooks";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/Table";

export function AvailabilitiesTable() {
  const { availabilities, loading, error, setAvailabilities } = useAvailabilities();

  if (loading) return <p>Loading availabilities...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // Delete availability
  async function handleDelete(id: string) {
    const { error } = await supabase.from("availabilities").delete().eq("id", id);
    if (error) {
      alert("❌ Failed to delete: " + error.message);
    } else {
      setAvailabilities((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Teacher</TableHeader>
          <TableHeader>Subject</TableHeader>
          <TableHeader>Start</TableHeader>
          <TableHeader>End</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {availabilities.map((a) => (
          <TableRow key={a.id}>
            <TableCell>{a.teacher?.name ?? "—"}</TableCell>
            <TableCell>{a.subject?.name ?? "—"}</TableCell>
            <TableCell>{new Date(a.start_time).toLocaleString()}</TableCell>
            <TableCell>{new Date(a.end_time).toLocaleString()}</TableCell>
            <TableCell>{a.status}</TableCell>
            <TableCell>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
