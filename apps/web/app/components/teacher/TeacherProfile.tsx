"use client";

import { useState } from "react";
import useAuthStore from "@repo/store/auth.store";
import { EditProfileModal } from "./EditProfileModal";

export default function TeacherProfile() {
  const { user } = useAuthStore();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      <div className="bg-white shadow rounded-lg p-4 max-w-md">
        <img
          src={user.avatar_url || "/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
        <p className="text-lg font-bold">{user.name}</p>
        <p className="text-gray-600">{user.email}</p>
        <p className="mt-2 text-sm italic">
          {user.bio || "No bio provided yet."}
        </p>

        <button
          onClick={() => setEditOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Edit Profile
        </button>
      </div>

      {editOpen && (
        <EditProfileModal user={user} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}
