import * as React from "react";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  const styles: Record<string, string> = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
