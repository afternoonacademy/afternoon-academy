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
import VenueModal from "@/app/components/admin/VenueModal";

interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  created_at: string;
  images?: { url: string }[]; // joined relation
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  async function loadVenues() {
    const { data, error } = await supabase
      .from("venues")
      .select(
        `
        id,
        name,
        address,
        capacity,
        created_at,
        images:venue_images(url)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to load venues:", error.message);
      setVenues([]);
    } else {
      setVenues(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this venue?")) return;
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) {
      alert("❌ Failed to delete venue: " + error.message);
    } else {
      setVenues((prev) => prev.filter((v) => v.id !== id));
    }
  }

  useEffect(() => {
    loadVenues();
  }, []);

  if (loading) return <p>Loading venues...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🏢 Venues</h2>
        <button
          onClick={() => {
            setEditingVenue(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Venue
        </button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Image</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Address</TableHeader>
            <TableHeader>Capacity</TableHeader>
            <TableHeader>Created</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {venues.map((v) => {
            const imageUrl = v.images?.[0]?.url;
            return (
              <TableRow key={v.id}>
                <TableCell>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={v.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded">
                      No image
                    </div>
                  )}
                </TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.address}</TableCell>
                <TableCell>{v.capacity}</TableCell>
                <TableCell>
                  {new Date(v.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingVenue(v);
                      setIsModalOpen(true);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <VenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVenueSaved={loadVenues}
        editingVenue={editingVenue}
      />
    </div>
  );
}
