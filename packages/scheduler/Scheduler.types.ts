export interface Teacher {
  id: string;
  name: string;
}

export interface SchedulerEvent {
  id: string;
  teacherId: string;
  start: Date | string;   // Date object or ISO string
  end: Date | string;
  title: string;
  status: "booked" | "open" | "cancelled";
}
