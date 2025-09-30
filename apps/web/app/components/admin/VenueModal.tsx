"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueSaved: () => void;
  editingVenue?: any | null;
}

export default function VenueModal({
  isOpen,
  onClose,
  onVenueSaved,
  editingVenue,
}: VenueModalProps) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    capacity: 10,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingVenue) {
      setForm({
        name: editingVenue.name,
        address: editingVenue.address,
        capacity: editingVenue.capacity,
      });
    } else {
      setForm({ name: "", address: "", capacity: 10 });
    }
  }, [editingVenue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingVenue) {
        const { error } = await supabase
          .from("venues")
          .update(form)
          .eq("id", editingVenue.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("venues").insert([form]);
        if (error) throw error;
      }

      onVenueSaved();
      onClose();
    } catch (err: any) {
      alert("❌ Failed to save venue: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {editingVenue ? "✏️ Edit Venue" : "➕ Add Venue"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              className="w-full border px-2 py-1 rounded"
              min={1}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingVenue ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
