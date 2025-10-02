"use client";

import * as React from "react";
import Image from "next/image";

export function Avatar({
  src,
  alt,
  className = "w-12 h-12 rounded-full",
  children,
}: {
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt || "avatar"}
        width={48}
        height={48}
        className={className}
      />
    );
  }

  return (
    <div
      className={`bg-gray-300 text-gray-700 flex items-center justify-center font-bold ${className}`}
    >
      {children ?? alt?.slice(0, 2).toUpperCase() ?? "??"}
    </div>
  );
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
      {children}
    </div>
  );
}
