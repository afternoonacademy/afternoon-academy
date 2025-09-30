"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";

export interface ScrollerProps {
  children: React.ReactNode;
  liquid?: boolean;
  overflowX: "auto" | "hidden" | "scroll";
  overflowY: "auto" | "hidden" | "scroll";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A scrollable container used inside SimpleScrollGrid.
 * Handles horizontal and vertical scrolling with refs exposed.
 */
export const Scroller = forwardRef<HTMLDivElement, ScrollerProps>(
  (
    {
      children,
      liquid = true,
      overflowX,
      overflowY,
      className = "",
      style = {},
    },
    ref
  ) => {
    const elRef = useRef<HTMLDivElement>(null);

    // Expose the div ref to parent
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    return (
      <div
        ref={elRef}
        className={`fc-scroller ${className}`}
        style={{
          overflowX,
          overflowY,
          WebkitOverflowScrolling: "touch",
          height: liquid ? "100%" : undefined,
          width: "100%",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);

Scroller.displayName = "Scroller";
