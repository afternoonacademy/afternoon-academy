"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
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

// Basic modal component
function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

const ROLES = ["all", "teacher", "parent", "student", "admin"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("all");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to load users:", error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleAddTeacher() {
    if (!newName || !newEmail) {
      alert("Please enter both name and email");
      return;
    }
    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });

      const { user, error } = await res.json();
      if (error) throw new Error(error);

      setUsers((prev) => [user, ...prev]);
      setNewName("");
      setNewEmail("");
      setModalOpen(false);
    } catch (err: any) {
      alert("❌ Failed to add teacher: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const { error } = await res.json();
      if (error) throw new Error(error);

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert("❌ Failed to delete user: " + err.message);
    }
  }

  const filteredUsers =
    activeRole === "all"
      ? users
      : users.filter((u) => u.role === activeRole);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">👥 Users</h2>
      <p className="text-gray-600">
        Manage all users of the platform. Parents and students are created
        through signup. You can create teachers here.
      </p>

      {/* Tabs */}
      <div className="flex gap-2">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-3 py-1 rounded ${
              activeRole === role
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {role === "all"
              ? "All Users"
              : role.charAt(0).toUpperCase() + role.slice(1) + "s"}
          </button>
        ))}
      </div>

      {/* Only show Add Teacher button when in Teacher tab */}
      {activeRole === "teacher" && (
        <button
          onClick={() => setModalOpen(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ➕ Add Teacher
        </button>
      )}

      {/* Users Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>Joined</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => (
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
                    <div className="text-zinc-500">
                      {user.email && (
                        <a
                          href={`mailto:${user.email}`}
                          className="hover:text-zinc-700"
                        >
                          {user.email}
                        </a>
                      )}
                    </div>
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

              <TableCell className="text-zinc-500">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—"}
              </TableCell>

              <TableCell>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for adding teacher */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">➕ Add Teacher</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Teacher name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="email"
            placeholder="Teacher email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTeacher}
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Teacher"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
