"use client";

import { useEffect, useState } from "react";
import { supabase } from "@repo/lib/supabase.client";

interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  cost_per_hour: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  booking_url?: string;
  terms_url?: string;
  notes?: string;
}

interface VenueImage {
  id: string;
  url: string;
  caption?: string;
}

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueSaved: () => void;
  editingVenue?: Venue | null;
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
    cost_per_hour: 0,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    booking_url: "",
    terms_url: "",
    notes: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<VenueImage[]>([]);
  const [saving, setSaving] = useState(false);

  // Load venue + existing images
  useEffect(() => {
    if (editingVenue) {
      setForm({
        name: editingVenue.name || "",
        address: editingVenue.address || "",
        capacity: editingVenue.capacity || 10,
        cost_per_hour: editingVenue.cost_per_hour || 0,
        contact_name: editingVenue.contact_name || "",
        contact_email: editingVenue.contact_email || "",
        contact_phone: editingVenue.contact_phone || "",
        booking_url: editingVenue.booking_url || "",
        terms_url: editingVenue.terms_url || "",
        notes: editingVenue.notes || "",
      });

      supabase
        .from("venue_images")
        .select("id, url, caption")
        .eq("venue_id", editingVenue.id)
        .then(({ data }) => {
          if (data) setExistingImages(data);
        });
    } else {
      setForm({
        name: "",
        address: "",
        capacity: 10,
        cost_per_hour: 0,
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        booking_url: "",
        terms_url: "",
        notes: "",
      });
      setExistingImages([]);
    }
  }, [editingVenue]);

  async function handleRemoveImage(img: VenueImage) {
    if (!confirm("Remove this image?")) return;

    const { error: dbErr } = await supabase
      .from("venue_images")
      .delete()
      .eq("id", img.id);

    if (dbErr) {
      alert("❌ Failed to remove image: " + dbErr.message);
      return;
    }

    const path = img.url.split("/").slice(-2).join("/");
    await supabase.storage.from("venues").remove([path]);

    setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let venueId = editingVenue?.id;

      if (editingVenue) {
        const { error } = await supabase
          .from("venues")
          .update(form)
          .eq("id", editingVenue.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("venues")
          .insert([form])
          .select("id")
          .single();
        if (error) throw error;
        venueId = data.id;
      }

      if (venueId && images.length > 0) {
        for (const file of images) {
          const filePath = `${venueId}/${Date.now()}-${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from("venues")
            .upload(filePath, file, { cacheControl: "3600", upsert: true });
          if (uploadErr) throw uploadErr;

          const {
            data: { publicUrl },
          } = supabase.storage.from("venues").getPublicUrl(filePath);

          const { error: imgErr } = await supabase.from("venue_images").insert([
            {
              venue_id: venueId,
              url: publicUrl,
              caption: file.name,
            },
          ]);
          if (imgErr) throw imgErr;
        }
      }

      onVenueSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("❌ Failed to save venue: " + err.message);
      } else {
        alert("❌ Failed to save venue: Unknown error");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editingVenue ? "✏️ Edit Venue" : "➕ Add Venue"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Info */}
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

          <div className="flex gap-2">
            <div className="flex-1">
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
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Cost per Hour (€)
              </label>
              <input
                type="number"
                value={form.cost_per_hour}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cost_per_hour: parseFloat(e.target.value),
                  })
                }
                className="w-full border px-2 py-1 rounded"
                min={0}
              />
            </div>
          </div>

          {/* Contact Info */}
          <h3 className="text-lg font-semibold mt-4">Contact Info</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) =>
                setForm({ ...form, contact_email: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone</label>
            <input
              type="text"
              value={form.contact_phone}
              onChange={(e) =>
                setForm({ ...form, contact_phone: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {/* Booking Info */}
          <h3 className="text-lg font-semibold mt-4">Booking Info</h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Website / Info Link
            </label>
            <input
              type="url"
              value={form.booking_url}
              onChange={(e) =>
                setForm({ ...form, booking_url: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Terms & Conditions URL
            </label>
            <input
              type="url"
              value={form.terms_url}
              onChange={(e) => setForm({ ...form, terms_url: e.target.value })}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border px-2 py-1 rounded"
              rows={3}
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mt-4">Existing Images</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.url}
                      alt={img.caption || "venue"}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <h3 className="text-lg font-semibold mt-4">Upload Images</h3>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full"
          />
          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
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
