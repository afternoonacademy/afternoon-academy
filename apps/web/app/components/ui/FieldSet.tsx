// components/ui/FieldSet.tsx
"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("space-y-1", className)}>{children}</div>;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}
