"use client";

import { useAvailabilityRequests } from "@repo/hooks/useAvailabilityRequests";
import useAuthStore from "@repo/store/auth.store";

export default function TeacherRequestsPage() {
  const { user } = useAuthStore();
  const { requests, loading, updateRequest } = useAvailabilityRequests(
    user?.id ?? null
  );

  if (loading) return <p>Loading requests…</p>;

  if (!requests.length)
    return <p className="text-gray-500">No pending requests.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📩 Availability Requests</h2>

      <ul className="space-y-4">
        {requests.map((req) => (
          <li
            key={req.id}
            className="border rounded p-4 bg-white shadow flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                Session Adjustment:{" "}
                {new Date(req.requested_start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                →{" "}
                {new Date(req.requested_end_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-600">
                Requested by: {req.users?.name || "Unknown"} ({req.status})
              </p>
            </div>

            {req.status === "pending" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => updateRequest(req.id, "approved")}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateRequest(req.id, "rejected")}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span
                className={`px-2 py-1 text-sm rounded ${
                  req.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {req.status}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
