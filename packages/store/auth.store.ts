console.log("🟢 Auth store loaded on web");

import { create } from "zustand";
import type { User } from "@repo/types";
import { account, getCurrentUser, signOut } from "@repo/lib/appwrite";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  isAdmin: () => boolean;
  isHost: () => boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  isAdmin: () => get().user?.role === "admin",
  isHost: () => {
    const role = get().user?.role ?? "guest";
    return role === "host" || role === "admin";
  },

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    console.log("🟡 fetchAuthenticatedUser called");
    set({ isLoading: true });
    try {
      console.log("🔍 Calling account.get()");
      const me = await account.get().catch((err) => {
        console.warn("⚠️ account.get() failed:", err);
        return null;
      });
      console.log("🔍 account.get result:", me);

      if (!me) {
        console.log("❌ No active session");
        set({ isAuthenticated: false, user: null });
      } else {
        console.log("✅ Session found, fetching user profile");
        const profile = await getCurrentUser().catch((err) => {
          console.warn("⚠️ getCurrentUser failed:", err);
          return null;
        });
        console.log("🔍 getCurrentUser result:", profile);

        set({ isAuthenticated: true, user: (profile as User) ?? null });
      }
    } catch (e) {
      console.error("fetchAuthenticatedUser error", e);
      set({ isAuthenticated: false, user: null });
    } finally {
      console.log("⏳ Done running fetchAuthenticatedUser");
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      console.log("🔍 Logging out via Appwrite");
      await signOut();
    } catch (e) {
      console.warn("⚠️ Logout failed (safe to ignore if no active session):", e);
    } finally {
      console.log("✅ Auth state cleared after logout");
      set({ isAuthenticated: false, user: null });
    }
  },
}));

export default useAuthStore;
