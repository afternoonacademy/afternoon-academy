"use client";

import { create } from "zustand";
import { supabase } from "@repo/lib/supabase.client";
import type { User } from "@repo/types";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  isAdmin: () => boolean;
  isParent: () => boolean;
  isStudent: () => boolean;
  isTeacher: () => boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: (force?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  isAdmin: () => get().user?.role === "admin",
  isParent: () => get().user?.role === "parent",
  isStudent: () => get().user?.role === "student",
  isTeacher: () => get().user?.role === "teacher",

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    console.log("🟡 [AuthStore] fetchAuthenticatedUser called");
    set({ isLoading: true });

    try {
      // 🔹 Get current auth session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getUser();

      if (sessionError || !sessionData?.user) {
        console.warn("❌ [AuthStore] No active session", sessionError);
        set({ isAuthenticated: false, user: null });
        return;
      }

      const authUser = sessionData.user;
      console.log("✅ [AuthStore] Auth user loaded:", authUser);

      // 🔹 Get extended profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.warn("⚠️ [AuthStore] Failed to load user profile:", profileError);
      }

      // 🔹 Merge into a single object
      const mergedUser: User = {
        id: authUser.id,
        email: authUser.email ?? "",
        name:
          profile?.name ??
          (authUser.user_metadata?.name as string | undefined) ??
          "",
        role:
          profile?.role ??
          (authUser.user_metadata?.role as string | undefined) ??
          "parent",
        created_at: profile?.created_at ?? undefined, // ✅ matches new type
      };

      console.log("✅ [AuthStore] Final merged user:", mergedUser);

      set({ isAuthenticated: true, user: mergedUser });
    } catch (e) {
      console.error("❌ [AuthStore] fetchAuthenticatedUser error:", e);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("⚠️ [AuthStore] Logout failed:", e);
    } finally {
      console.log("✅ [AuthStore] Cleared auth state");
      set({ isAuthenticated: false, user: null });
    }
  },
}));

export default useAuthStore;
