"use client";

import React from "react";
import { SchedulerEvent, Teacher } from "./Scheduler.types";

interface SchedulerFullProps {
  teachers: Teacher[];
  events: SchedulerEvent[];
  startHour?: number;
  endHour?: number;
  onEventClick?: (event: SchedulerEvent) => void;
  onSlotClick?: (teacher: Teacher, hour: number) => void;
}

export default function SchedulerFull({
  teachers,
  events,
  startHour = 8,
  endHour = 20,
  onEventClick,
  onSlotClick,
}: SchedulerFullProps) {
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );

  return (
    <div className="fc fc-theme-standard w-full h-[80vh]">
      <div className="fc-view-harness fc-view-harness-active">
        <div className="fc-view">
          <table
            role="grid"
            className="fc-scrollgrid"
            style={{ height: "100%", width: "100%" }}
          >
            {/* Header row (hours) */}
            <thead
              role="rowgroup"
              className="fc-scrollgrid-section fc-scrollgrid-section-header"
            >
              <tr role="presentation">
                <th className="fc-col-header-cell fc-scrollgrid-shrink">
                  <div className="fc-col-header-cell-cushion">Teacher</div>
                </th>
                {hours.map((h) => (
                  <th key={h} className="fc-col-header-cell">
                    <div className="fc-col-header-cell-cushion">{h}:00</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows (teachers x hours) */}
            <tbody
              role="rowgroup"
              className="fc-scrollgrid-section fc-scrollgrid-section-body"
            >
              {teachers.map((t) => (
                <tr key={t.id} role="row" className="fc-resource-row">
                  {/* Teacher name cell */}
                  <td className="fc-resource-cell">{t.name}</td>

                  {/* Hour slots */}
                  {hours.map((h) => {
                    const slotEvents = events.filter((e) => {
                      const start = new Date(e.start);
                      const end = new Date(e.end);
                      return (
                        e.teacherId === t.id &&
                        start.getHours() <= h &&
                        end.getHours() > h
                      );
                    });

                    return (
                      <td
                        key={h}
                        className="fc-timegrid-slot"
                        onClick={() => onSlotClick?.(t, h)}
                      >
                        <div className="fc-timegrid-slot-frame relative h-16">
                          {slotEvents.map((ev) => (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick?.(ev);
                              }}
                              className="fc-h-event fc-event absolute inset-1 flex items-center justify-center cursor-pointer"
                              style={{
                                backgroundColor:
                                  ev.status === "booked"
                                    ? "#2563eb"
                                    : ev.status === "open"
                                    ? "#16a34a"
                                    : "#dc2626",
                              }}
                            >
                              <div className="fc-event-main">
                                <div className="fc-event-title">{ev.title}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
