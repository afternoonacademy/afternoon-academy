"use client";

import { useState } from "react";
import { supabase } from "@repo/lib/supabase.client";
import useAuthStore from "@repo/store/auth.store";

interface Props {
  onClose: () => void;
}

export function EditProfileModal({ onClose }: Props) {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  // ✅ Upload avatar to Supabase Storage and update public.users
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${user.id}-${Date.now()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // ✅ Always target public.users
      const { error: dbError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setUser({ ...user, avatar_url: publicUrl });
    } catch (err) {
      console.error("❌ Avatar upload failed:", err);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  // ✅ Save profile fields
  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users") // ✅ public.users
        .update({ name, bio })
        .eq("id", user.id);

      if (error) throw error;

      setUser({ ...user, name, bio });
      onClose();
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Edit Profile
        </h2>

        {/* Avatar Upload */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={
              user.avatar_url ||
              "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User")
            }
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <label className="text-sm text-primary cursor-pointer">
            {uploading ? "Uploading..." : "Change Avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <label className="block mb-1 text-sm font-medium">Name</label>
        <input
          className="w-full border rounded px-2 py-1 mb-4 dark:bg-zinc-700 dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Bio */}
        <label className="block mb-1 text-sm font-medium">Bio</label>
        <textarea
          className="w-full border rounded px-2 py-1 mb-4 dark:bg-zinc-700 dark:text-white"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md dark:bg-zinc-700"
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
