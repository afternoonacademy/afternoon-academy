export type CalendarEventType = "availability" | "session" | "booking";
export type CalendarStatus = "open" | "booked" | "cancelled";

export interface Teacher {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  status: CalendarStatus;
  start: Date;
  end: Date;

  /** Shown in event block */
  title: string;

  /** Optional details */
  subject?: string;
  teacher?: Teacher;
}
