export interface ScrollbarWidths {
  x: number;
  y: number;
}

let cached: ScrollbarWidths | null = null;

// Detect native scrollbar widths
export function getScrollbarWidths(): ScrollbarWidths {
  if (cached) return cached;

  if (typeof document === "undefined") {
    return { x: 0, y: 0 }; // SSR safety
  }

  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = "-9999px";
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.overflow = "scroll";

  document.body.appendChild(div);

  const x = div.offsetHeight - div.clientHeight;
  const y = div.offsetWidth - div.clientWidth;

  document.body.removeChild(div);

  cached = { x, y };
  return cached;
}
