"use client";

import React, { useState } from "react";
import CalendarWeek from "./CalendarWeek";
import CalendarMonth from "./CalendarMonth";
import { CalendarDay } from "./CalendarDay";
import type { CalendarEvent } from "./Calendar.types";

type View = "month" | "week" | "day";

interface CalendarProps {
  events: CalendarEvent[];
  onSelectSlot?: (day: number, hour: number) => void;
  onEventPress?: (event: CalendarEvent) => void;
}

export function Calendar({ events, onSelectSlot, onEventPress }: CalendarProps) {
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  function goToNext() {
    const d = new Date(currentDate);
    if (view === "week") d.setDate(d.getDate() + 7);
    if (view === "day") d.setDate(d.getDate() + 1);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  }

  function goToPrev() {
    const d = new Date(currentDate);
    if (view === "week") d.setDate(d.getDate() - 7);
    if (view === "day") d.setDate(d.getDate() - 1);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-white shadow">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={goToPrev}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            ◀
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            ▶
          </button>
        </div>
        <h2 className="text-lg font-bold">
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView("month")}
            className={`px-2 py-1 border rounded ${
              view === "month" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-2 py-1 border rounded ${
              view === "week" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("day")}
            className={`px-2 py-1 border rounded ${
              view === "day" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* View switcher */}
      <div className="p-2">
        {view === "week" && (
          <CalendarWeek
            events={events}
            currentDate={currentDate}
            onSelectSlot={onSelectSlot}
            onEventPress={onEventPress}
          />
        )}
        {view === "month" && (
          <CalendarMonth
            events={events}
            currentDate={currentDate}
            onEventPress={onEventPress}
          />
        )}
        {view === "day" && (
          <CalendarDay
            events={events}
            currentDate={currentDate}
            onSelectSlot={onSelectSlot}
            onEventPress={onEventPress}
          />
        )}
      </div>
    </div>
  );
}
