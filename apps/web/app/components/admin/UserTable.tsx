"use client";

import { useState } from "react";
import { useUsers } from "@repo/hooks";

import { Avatar, AvatarFallback } from "@/app/components/ui/Avatar";
import { Badge } from "@/app/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/Table";

export function UserTable() {
  const { users, loading, error, addTeacher } = useUsers();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  async function handleAddTeacher() {
    if (!name || !email) return alert("Please enter name and email");
    setIsSaving(true);
    try {
      await addTeacher(name, email);
      setName("");
      setEmail("");
    } catch (err: any) {
      alert("❌ Failed to add teacher: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Teacher Form */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Teacher name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="email"
          placeholder="Teacher email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={handleAddTeacher}
          disabled={isSaving}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSaving ? "Adding..." : "Add Teacher"}
        </button>
      </div>

      {/* User Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>Joined</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name ?? "Unnamed"}</div>
                    <div className="text-zinc-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === "admin"
                      ? "destructive"
                      : user.role === "teacher"
                      ? "default"
                      : user.role === "student"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
