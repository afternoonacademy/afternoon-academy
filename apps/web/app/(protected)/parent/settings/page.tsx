"use client";

import useAuthStore from "@repo/store/auth.store";
import { useRouter } from "next/navigation";

export default function ParentSettingsPage() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    console.log("👉 [ParentSettings] Logout clicked");
    await logout();
    router.replace("/");
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        🚪 Log Out
      </button>
    </div>
  );
}
