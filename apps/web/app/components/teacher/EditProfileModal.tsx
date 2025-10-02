import { useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import type { User } from "@repo/types";

interface Props {
  user: User;
  onClose: () => void;
}

export function EditProfileModal({ user, onClose }: Props) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ name, bio })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    } else {
      onClose();
      window.location.reload(); // reload to refresh Zustand store
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

        <label className="block mb-2 text-sm font-medium">Name</label>
        <input
          className="w-full border rounded px-2 py-1 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium">Bio</label>
        <textarea
          className="w-full border rounded px-2 py-1 mb-4"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
