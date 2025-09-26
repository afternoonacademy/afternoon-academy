"use client";

import { useEffect } from "react";
import useAuthStore from "@repo/store/auth.store";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout, fetchAuthenticatedUser } =
    useAuthStore();

  useEffect(() => {
    console.log("🟢 HomePage mounted, fetching authenticated user");
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  if (isLoading) {
    console.log("⏳ Still loading auth state...");
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>⏳ Loading...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated → redirecting to /sign-in");
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    return null;
  }

  console.log("✅ Authenticated, rendering HomePage with user:", user);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">🏡 Home</h1>

      <div className="bg-white shadow rounded p-4 w-full max-w-md">
        <p className="mb-2">
          <strong>Name:</strong> {user?.name}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {user?.email}
        </p>
        <p className="mb-4">
          <strong>Role:</strong> {user?.role}
        </p>

        <button
          onClick={async () => {
            console.log("👉 Logout button pressed");
            await logout();
            console.log("✅ Logout finished, redirecting to /sign-in");
            if (typeof window !== "undefined") {
              window.location.href = "/sign-in";
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          🚪 Log Out
        </button>
      </div>
    </main>
  );
}
