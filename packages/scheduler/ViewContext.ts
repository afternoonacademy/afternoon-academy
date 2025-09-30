"use client";

import { createContext } from "./preact";

export interface ViewContext {
  theme: {
    getClass: (name: string) => string;
  };
  addResizeHandler?: (cb: () => void) => void;
  removeResizeHandler?: (cb: () => void) => void;
}

// Default theme with a simple passthrough
const defaultTheme = {
  getClass: (name: string) => {
    if (name === "table") return "fc-theme-standard";
    return "";
  },
};

// Create React/Preact context
export const ViewContext = createContext<ViewContext>({
  theme: defaultTheme,
});
