import { useMemo } from "react";
import { CalendarEvent } from "./Calendar.types";

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectSlot?: (date: Date) => void;
  onEventPress?: (event: CalendarEvent) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i); // 0–23 hours

export default function CalendarWeek({
  currentDate,
  events,
  onSelectSlot,
  onEventPress,
}: Props) {
  // Start of week (Monday as first day)
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // Sunday = 0
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [currentDate]);

  // Array of days for the week
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  // Attach layout info to events
  const weekEvents = events.map((ev) => {
    const dayIdx = days.findIndex(
      (d) =>
        d.getDate() === ev.start.getDate() &&
        d.getMonth() === ev.start.getMonth() &&
        d.getFullYear() === ev.start.getFullYear()
    );
    const startHour = ev.start.getHours();
    const durationHrs = Math.max(
      1,
      (ev.end.getTime() - ev.start.getTime()) / (1000 * 60 * 60)
    );

    return {
      ...ev,
      dayIdx,
      startHour,
      durationHrs,
    };
  });

  return (
    <div className="w-full border border-gray-200 rounded overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200 text-sm font-semibold">
        <div className="p-2 text-center">Time</div>
        {days.map((d, i) => (
          <div
            key={i}
            className="p-2 text-center border-l border-gray-200"
          >
            {d.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
            })}
          </div>
        ))}
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-8">
        {/* Hours column */}
        <div className="flex flex-col">
          {hours.map((h) => (
            <div
              key={h}
              className="h-16 border-b border-gray-200 text-xs text-right pr-2"
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => (
          <div
            key={day.toISOString()}
            className="relative grid grid-rows-24 border-l border-gray-200"
          >
            {/* Empty slots (clickable) */}
            {hours.map((h) => (
              <div
                key={h}
                className="h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  onSelectSlot?.(new Date(day.setHours(h, 0, 0, 0)))
                }
              />
            ))}

            {/* Render events */}
            {weekEvents
              .filter((ev) => ev.dayIdx === dayIdx)
              .map((ev) => (
                <div
                  key={ev.id}
                  className={`absolute left-1 right-1 rounded px-2 py-1 text-xs text-white cursor-pointer ${
                    ev.status === "booked"
                      ? "bg-blue-600"
                      : ev.status === "open"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                  style={{
                    top: `${ev.startHour * 4}rem`, // 64px per hour
                    height: `${ev.durationHrs * 4}rem`,
                  }}
                  onClick={() => onEventPress?.(ev)}
                >
                  <div className="font-semibold">{ev.title}</div>
                  {ev.teacher?.name && (
                    <div className="text-[10px] opacity-80">
                      {ev.teacher.name}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
