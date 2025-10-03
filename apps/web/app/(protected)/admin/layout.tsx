"use client";

import type { ReactNode } from "react";
import BaseLayout from "@/app/components/BaseLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>;
}
