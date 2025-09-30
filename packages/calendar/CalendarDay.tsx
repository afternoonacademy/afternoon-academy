"use client";

import React from "react";
import { View, Text, Pressable } from "react-native";
import type { CalendarEvent } from "./Calendar.types";

interface CalendarDayProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectSlot?: (day: number, hour: number) => void;
  onEventPress?: (event: CalendarEvent) => void;
}

export function CalendarDay({
  currentDate,
  events,
  onSelectSlot,
  onEventPress,
}: CalendarDayProps) {
  // Generate hours 0–23
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events to just this date
  const dayEvents = events.filter(
    (ev) =>
      ev.start.toDateString() === currentDate.toDateString() ||
      ev.end.toDateString() === currentDate.toDateString()
  );

  return (
    <View className="w-full">
      {/* Header */}
      <View className="border-b p-2 bg-gray-50">
        <Text className="text-lg font-semibold">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Grid */}
      <View className="flex-row">
        {/* Hours column */}
        <View className="w-16 border-r bg-gray-50">
          {hours.map((h) => (
            <View key={h} className="h-16 border-b justify-start p-1">
              <Text className="text-xs text-gray-500">
                {h === 0
                  ? "12 AM"
                  : h < 12
                  ? `${h} AM`
                  : h === 12
                  ? "12 PM"
                  : `${h - 12} PM`}
              </Text>
            </View>
          ))}
        </View>

        {/* Events column */}
        <View className="flex-1">
          {hours.map((h) => {
            const slotEvents = dayEvents.filter(
              (ev) =>
                ev.start.getHours() <= h &&
                ev.end.getHours() > h
            );

            return (
              <Pressable
                key={h}
                className="h-16 border-b relative"
                onPress={() =>
                  onSelectSlot?.(currentDate.getDate(), h)
                }
              >
                {slotEvents.map((ev) => {
                  const color =
                    ev.status === "booked"
                      ? "bg-blue-500"
                      : ev.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-green-500";

                  return (
                    <Pressable
                      key={ev.id}
                      className={`absolute left-1 right-1 rounded p-1 ${color}`}
                      style={{
                        top: 2,
                        bottom: 2,
                      }}
                      onPress={(e) => {
                        e.stopPropagation();
                        onEventPress?.(ev);
                      }}
                    >
                      <Text className="text-white text-xs font-semibold">
                        {ev.teacher?.name || "Unassigned"}
                      </Text>
                      {ev.subject && (
                        <Text className="text-white text-xs">
                          {ev.subject}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
