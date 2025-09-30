"use client";

import { VNode, createElement } from "./preact";
import { Component } from "preact"; // needed for class components
import { ViewContext } from "./ViewContext"; // we’ll set this up shortly
import {
  ColProps,
  SectionConfig,
  ChunkConfig,
  CssDimValue,
} from "./util";

// Props for ScrollGrid
export interface ScrollGridProps {
  elRef?: any;
  colGroups?: ColGroupConfig[];
  sections: ScrollGridSectionConfig[];
  liquid: boolean; // liquid *height*
  forPrint: boolean;
  collapsibleWidth: boolean; // can ALL sections be fully collapsed in width?
}

export interface ScrollGridSectionConfig extends SectionConfig {
  key: string;
  chunks?: ScrollGridChunkConfig[]; // TODO: make this mandatory, somehow also accommodate outerContent
}

export interface ScrollGridChunkConfig extends ChunkConfig {
  key: string;
}

export interface ColGroupConfig {
  width?: CssDimValue;
  cols: ColProps[];
}

// This mirrors FullCalendar’s type
export type ScrollGridImpl = {
  new (props: ScrollGridProps, context: ViewContext): Component<ScrollGridProps>;
};
