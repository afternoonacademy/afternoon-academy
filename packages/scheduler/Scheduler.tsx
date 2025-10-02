"use client";

import React, { useMemo, useState } from "react";
import SchedulerGrid from "./SchedulerGrid";
import type { Teacher, SchedulerEvent } from "@repo/types";

export interface SchedulerProps {
  date?: Date;
  startHour?: number;
  endHour?: number;
  teachers: Teacher[];
  events: SchedulerEvent[];
  onEventClick?: (event: SchedulerEvent) => void;
  onSlotClick?: (teacher: Teacher, start: Date, end: Date) => void;
  rowHeight?: number;
  colWidth?: number;
  singleTeacherMode?: boolean;
}

type ViewMode = "day" | "week" | "month";

// ✅ helper to normalise statuses
function normalizeStatus(status: string): SchedulerEvent["status"] {
  switch (status) {
    case "available":
      return "available";
    case "bookable":
      return "bookable";
    case "unassigned":
      return "unassigned";
    case "booked":
      return "booked";
    case "cancelled":
      return "cancelled";
    default:
      return "available"; // fallback
  }
}

export default function Scheduler({
  date: initialDate = new Date(),
  startHour = 8,
  endHour = 18,
  teachers,
  events,
  onEventClick,
  onSlotClick,
  rowHeight = 60,
  colWidth = 120,
  singleTeacherMode = false,
}: SchedulerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [date, setDate] = useState<Date>(initialDate);

  // auto-scale for teacher view
  const effectiveRowHeight = singleTeacherMode ? 100 : rowHeight;
  const effectiveColWidth = singleTeacherMode ? 160 : colWidth;

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = startHour; h < endHour; h++) list.push(h);
    return list;
  }, [startHour, endHour]);

  // 🔵 Navigation
  const goPrev = () => {
    const newDate = new Date(date);
    if (viewMode === "day") newDate.setDate(newDate.getDate() - 1);
    if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
    if (viewMode === "month") newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const goNext = () => {
    const newDate = new Date(date);
    if (viewMode === "day") newDate.setDate(newDate.getDate() + 1);
    if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
    if (viewMode === "month") newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
  };

  const goToToday = () => setDate(new Date());

  // 🔵 Filter events + normalise statuses
  const filteredEvents = useMemo(() => {
    const normalized = events.map((ev) => ({
      ...ev,
      status: normalizeStatus(ev.status),
    }));

    if (viewMode === "day") {
      return normalized.filter((ev) => {
        const d = new Date(ev.start);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      });
    }

    if (viewMode === "week") {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59);

      return normalized.filter((ev) => {
        const d = new Date(ev.start);
        return d >= startOfWeek && d <= endOfWeek;
      });
    }

    if (viewMode === "month") {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59);

      return normalized.filter((ev) => {
        const d = new Date(ev.start);
        return d >= startOfMonth && d <= endOfMonth;
      });
    }

    return normalized;
  }, [events, date, viewMode]);

  // 🔵 Title
  const title =
    viewMode === "week"
      ? `${date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })} - ${new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 6
        ).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}`
      : viewMode === "month"
      ? date.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })
      : date.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        });

  return (
    <div className="scheduler h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 border-b bg-gray-50 sticky top-0 z-20 px-2">
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ◀
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Today
          </button>
          <button
            onClick={goNext}
            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ▶
          </button>
        </div>

        <h2 className="text-lg font-semibold">{title}</h2>

        <div className="flex gap-2">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-auto">
        <SchedulerGrid
          teachers={teachers}
          events={filteredEvents}
          startHour={startHour}
          endHour={endHour}
          date={date}
          view={viewMode}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
          rowHeight={effectiveRowHeight}
          colWidth={effectiveColWidth}
          singleTeacherMode={singleTeacherMode}
        />
      </div>
    </div>
  );
}
