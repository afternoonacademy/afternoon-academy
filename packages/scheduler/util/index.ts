import React from "react";

// Types
export interface ColProps {
  width?: string | number;
  minWidth?: string | number;
  span?: number;
}

export type CssDimValue = string | number;

export interface SectionConfig {
  id?: string;
  type?: string;       // added for SimpleScrollGrid
  expandRows?: boolean;
  maxHeight?: CssDimValue;
}

export interface ChunkConfig {
  id?: string;
  elRef?: React.RefObject<HTMLElement>;
  scrollerElRef?: React.RefObject<HTMLElement>;
  isSticky?: boolean;
}

// Functions
export function computeShrinkWidth(): number {
  return 0; // stub
}

export function hasShrinkWidth(): boolean {
  return false; // stub
}

export function isColPropsEqual(a: ColProps, b: ColProps): boolean {
  return a.width === b.width && a.minWidth === b.minWidth && a.span === b.span;
}

export function renderMicroColGroup(_: ColProps[]): React.ReactElement | null {
  return null; // stubbed out colgroup
}

export function getScrollGridClassNames(): string[] {
  return [];
}

export function getSectionClassNames(): string[] {
  return [];
}

export function getAllowYScrolling(): boolean {
  return false;
}

export function renderChunkContent(): React.ReactElement | null {
  return null;
}

export function getSectionHasLiquidHeight(): boolean {
  return false;
}

// Bridge to your scrollbar util
export function getScrollbarWidths() {
  return { left: 0, right: 0, top: 0, bottom: 0 }; // stub
}
