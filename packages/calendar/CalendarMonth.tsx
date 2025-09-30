"use client";

import { View, Text, Pressable } from "react-native";
import { CalendarEvent } from "./Calendar.types";

interface CalendarMonthProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick?: (day: Date) => void;
}

export default function CalendarMonth({
  currentDate,
  events,
  onDayClick,
}: CalendarMonthProps) {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  const weeks: Date[][] = [];
  let week: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    week.push(d);
    if (d.getDay() === 6 || i === daysInMonth) {
      weeks.push(week);
      week = [];
    }
  }

  return (
    <View className="border border-gray-200 rounded-lg">
      <View className="grid grid-cols-7 border-b border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Text key={d} className="text-center font-medium py-2">
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} className="grid grid-cols-7 border-b border-gray-200">
          {week.map((day) => {
            const dayEvents = events.filter(
              (e) =>
                e.start.toDateString() === day.toDateString() ||
                e.end.toDateString() === day.toDateString()
            );
            return (
              <Pressable
                key={day.toISOString()}
                className="border-l border-gray-200 h-24 p-1"
                onPress={() => onDayClick?.(day)}
              >
                <Text className="text-xs font-medium">{day.getDate()}</Text>
                {dayEvents.map((ev) => (
                  <Text key={ev.id} className="text-[10px] truncate">
                    {ev.title}
                  </Text>
                ))}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
