"use client";

import React, { useRef, useEffect } from "react";
import type { SchedulerEvent, Teacher } from "@repo/types";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./SchedulerGrid.css";

function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            className="z-50 rounded-md bg-white px-3 py-2 text-sm text-black shadow-lg border border-gray-200"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-white stroke-gray-200" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

interface SchedulerGridProps {
  teachers: Teacher[];
  events: SchedulerEvent[];
  startHour?: number;
  endHour?: number;
  rowHeight?: number;
  colWidth?: number;
  onEventClick?: (event: SchedulerEvent & { action?: "edit" | "delete" }) => void;
  onSlotClick?: (teacher: Teacher, start: Date, end: Date) => void;
  date?: Date;
  view?: "day" | "week" | "month";
}

export default function SchedulerGrid({
  teachers,
  events,
  startHour = 8,
  endHour = 20,
  rowHeight = 60,
  colWidth = 120,
  onEventClick,
  onSlotClick,
  date = new Date(),
  view = "day",
}: SchedulerGridProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const teacherRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // sync scroll
  useEffect(() => {
    const body = bodyRef.current;
    const header = headerRef.current;
    const teacher = teacherRef.current;
    if (!body || !header || !teacher) return;
    const onScroll = () => {
      header.scrollLeft = body.scrollLeft;
      teacher.scrollTop = body.scrollTop;
    };
    body.addEventListener("scroll", onScroll);
    return () => body.removeEventListener("scroll", onScroll);
  }, []);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  const days =
    view === "week"
      ? Array.from({ length: 7 }, (_, i) => {
          const d = new Date(date);
          d.setDate(date.getDate() - date.getDay() + i);
          d.setHours(0, 0, 0, 0);
          return d;
        })
      : view === "month"
      ? Array.from(
          { length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() },
          (_, i) => new Date(date.getFullYear(), date.getMonth(), i + 1)
        )
      : [new Date(date.getFullYear(), date.getMonth(), date.getDate())];

  return (
    <div className="scheduler">
      {/* Header */}
      <div className="scheduler-header">
        <div className="teacher-col-header" />
        <div className="time-header" ref={headerRef}>
          <div
            className="time-row"
            style={{
              gridTemplateColumns:
                view === "month"
                  ? `repeat(${days.length}, ${colWidth}px)`
                  : `repeat(${days.length * hours.length}, ${colWidth}px)`,
            }}
          >
            {view === "month"
              ? days.map((d) => (
                  <div key={d.toDateString()} className="time-cell">
                    {d.getDate()}
                  </div>
                ))
              : days.map((d) =>
                  hours.map((h) => (
                    <div key={`${d.toDateString()}-${h}`} className="time-cell">
                      {h}:00
                      {hours[0] === h && (
                        <div className="font-semibold">
                          {d.toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="scheduler-body">
        <div className="teacher-col" ref={teacherRef}>
          {teachers.map((t) => (
            <div key={t.id} className="teacher-cell" style={{ height: rowHeight }}>
              {t.name}
            </div>
          ))}
        </div>

        <div className="grid-scroll" ref={bodyRef}>
          <div
            className="grid"
            style={{
              gridTemplateColumns:
                view === "month"
                  ? `repeat(${days.length}, ${colWidth}px)`
                  : `repeat(${days.length * hours.length}, ${colWidth}px)`,
              gridTemplateRows: `repeat(${teachers.length}, ${rowHeight}px)`,
            }}
          >
            {/* Slots */}
            {teachers.map((t, row) =>
              days.flatMap((d, di) =>
                view === "month"
                  ? [
                      <div
                        key={`${t.id}-${d.toDateString()}`}
                        className="grid-cell hover:bg-gray-50 cursor-pointer"
                        style={{
                          gridColumn: di + 1,
                          gridRow: row + 1,
                        }}
                        onClick={() => {
                          const slotStart = new Date(d);
                          const slotEnd = new Date(d);
                          slotEnd.setDate(slotEnd.getDate() + 1);
                          onSlotClick?.(t, slotStart, slotEnd);
                        }}
                      />,
                    ]
                  : hours.map((h, hi) => {
                      const slotStart = new Date(d);
                      slotStart.setHours(h, 0, 0, 0);
                      const slotEnd = new Date(slotStart);
                      slotEnd.setHours(h + 1);
                      return (
                        <div
                          key={`${t.id}-${d.toDateString()}-${h}`}
                          className="grid-cell hover:bg-gray-50 cursor-pointer"
                          style={{
                            gridColumn: hi + 1 + hours.length * di,
                            gridRow: row + 1,
                          }}
                          onClick={() => onSlotClick?.(t, slotStart, slotEnd)}
                        />
                      );
                    })
              )
            )}

            {/* Events */}
            {events.map((ev) => {
              const teacherIndex = teachers.findIndex((t) => t.id === ev.teacherId);
              if (teacherIndex === -1) return null;

              const start = new Date(ev.start);
              const end = new Date(ev.end);

              const tooltipContent = (
                <div className="space-y-1">
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-gray-600">
                    {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                    {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs">
                    <strong>Status:</strong> {ev.status}
                  </p>

                  {ev.type === "session" && (
                    <>
                      <p className="text-xs">
                        <strong>Subject:</strong> {ev.subject || "(No subject yet)"}
                      </p>
                      <p className="text-xs">
                        <strong>Venue:</strong> {ev.venue || "(Unassigned venue)"}
                      </p>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.({ ...ev, action: "edit" });
                      }}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Edit
                    </button>
                    
                  </div>
                </div>
              );

              // Find the correct day
              const dayIndex = days.findIndex(
                (d) =>
                  d.getDate() === start.getDate() &&
                  d.getMonth() === start.getMonth() &&
                  d.getFullYear() === start.getFullYear()
              );
              if (dayIndex === -1) return null;

              // ✅ Fractional support: compute precise position
              const startHourFloat = start.getHours() + start.getMinutes() / 60;
              const endHourFloat = end.getHours() + end.getMinutes() / 60;
              const durationHours = endHourFloat - startHourFloat;

              const startHourIndex = Math.max(startHourFloat - startHour, 0);

              return (
                <Tooltip key={ev.id} content={tooltipContent}>
                  <div
                    className={`event event-${ev.status} cursor-pointer`}
                    style={{
                      gridColumn: `${dayIndex * hours.length + Math.floor(startHourIndex) + 1} / span ${Math.ceil(durationHours)}`,
                      gridRow: teacherIndex + 1,
                    }}
                  >
                    {ev.title}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
