// packages/scheduler/types.ts

export interface Teacher {
  id: string;
  name: string;
}

export type AvailabilityStatus = "open" | "ready" | "booked" | "cancelled";

export interface SchedulerEvent {
  id: string;
  teacherId: string;
  start: Date;
  end: Date;
  title: string;
  status: AvailabilityStatus;
}
