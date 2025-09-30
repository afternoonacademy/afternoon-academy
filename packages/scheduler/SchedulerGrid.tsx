"use client";

import React, { useRef, useEffect } from "react";
import type { SchedulerEvent, Teacher } from "./types";

interface SchedulerGridProps {
  teachers: Teacher[];
  events: SchedulerEvent[];
  startHour?: number;
  endHour?: number;
  rowHeight?: number;
  colWidth?: number;
  onEventClick?: (event: SchedulerEvent) => void;
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
          return d;
        })
      : view === "month"
      ? Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => {
          return new Date(date.getFullYear(), date.getMonth(), i + 1);
        })
      : [date];

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

              if (view === "month") {
                const startDay = start.getDate() - 1;
                const endDay = end.getDate() - 1;
                const span = Math.max(1, endDay - startDay + 1);

                return (
                  <div
                    key={ev.id}
                    className={`event event-${ev.status} cursor-pointer`}
                    style={{
                      gridColumn: `${startDay + 1} / span ${span}`,
                      gridRow: teacherIndex + 1,
                    }}
                    onClick={() => onEventClick?.(ev)}
                  >
                    {ev.title}
                  </div>
                );
              }

              const dayIndex = days.findIndex(
                (d) =>
                  d.getDate() === start.getDate() &&
                  d.getMonth() === start.getMonth() &&
                  d.getFullYear() === start.getFullYear()
              );
              if (dayIndex === -1) return null;

              const startHourIndex = start.getHours() - startHour;
              const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

              return (
                <div
                  key={ev.id}
                  className={`event event-${ev.status} cursor-pointer`}
                  style={{
                    gridColumn: `${dayIndex * hours.length + startHourIndex + 1} / span ${durationHours}`,
                    gridRow: teacherIndex + 1,
                  }}
                  onClick={() => onEventClick?.(ev)}
                >
                  {ev.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scheduler {
          display: flex;
          flex-direction: column;
          border: 1px solid #ddd;
          height: 600px;
          width: 100%;
        }
        .scheduler-header {
          display: flex;
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
        }
        .teacher-col-header {
          width: 150px;
          border-right: 1px solid #ddd;
          background: #f8f9fa;
        }
        .time-header {
          overflow-x: hidden;
          flex: 1;
        }
        .time-row {
          display: grid;
        }
        .time-cell {
          text-align: center;
          padding: 4px;
          border-right: 1px solid #eee;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }
        .scheduler-body {
          display: flex;
          flex: 1;
          min-height: 0;
        }
        .teacher-col {
          width: 150px;
          overflow-y: hidden;
          border-right: 1px solid #ddd;
        }
        .teacher-cell {
          display: flex;
          align-items: center;
          padding-left: 8px;
          font-weight: 500;
          border-bottom: 1px solid #f0f0f0;
        }
        .grid-scroll {
          flex: 1;
          overflow: auto;
          position: relative;
        }
        .grid {
          display: grid;
          position: relative;
        }
        .grid-cell {
          border-bottom: 1px solid #f9f9f9;
          border-right: 1px solid #f9f9f9;
        }
        .event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 12px;
          overflow: hidden;
          border: 1px solid transparent;
        }
        .event-open {
          background: #d3f9d8;
          border-color: #69db7c;
        }
        .event-ready {
          background: #fff3bf;
          border-color: #ffd43b;
        }
        .event-booked {
          background: #ffd8d8;
          border-color: #ff6b6b;
        }
        .event-cancelled {
          background: #e9ecef;
          border-color: #868e96;
        }
      `}</style>
    </div>
  );
}
