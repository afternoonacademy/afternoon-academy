// apps/web/components/AuthGate.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@repo/store/auth.store";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchAuthenticatedUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !pathname.startsWith("/sign-in") && !pathname.startsWith("/sign-up")) {
        router.replace("/sign-in");
      }
      if (isAuthenticated && pathname.startsWith("/sign-in")) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) return <p>Loading...</p>;

  return <>{children}</>;
}
