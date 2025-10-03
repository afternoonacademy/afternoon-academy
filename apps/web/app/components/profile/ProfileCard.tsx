"use client";

import { useState } from "react";
import useAuthStore from "@repo/store/auth.store";
import { EditProfileModal } from "./EditProfileModal";

export default function ProfileCard() {
  const { user } = useAuthStore();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-4">
        <img
          src={
            user.avatar_url ||
            "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User")
          }
          alt="avatar"
          className="w-24 h-24 rounded-full mb-4 object-cover"
        />
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.name}</p>
        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
          {user.bio || "No bio provided yet."}
        </p>

        <button
          onClick={() => setEditOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Edit Profile
        </button>
      </div>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}
