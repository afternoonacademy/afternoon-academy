"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            className="z-50 rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
