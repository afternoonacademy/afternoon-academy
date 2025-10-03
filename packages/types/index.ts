export type Role = "admin" | "parent" | "student" | "teacher";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  avatar?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Session {
  id: string;
  start_time: string;
  end_time: string;
  status: "bookable" | "booked" | "cancelled" | "unassigned";
  capacity: number;
  subject?: { id: string; name: string };
  teacher?: { id: string; name: string };
  venue?: { id: string; name: string };
}

export interface Booking {
  id: string;
  status: string;
  created_at: string;
  parent?: { id: string; name: string; email: string };
  student?: { id: string; name: string; age: number };
  session?: { id: string; start_time: string; end_time: string; subject?: { name: string } };
}

export interface Teacher {
  id: string;
  name: string;
}

/**
 * Matches DB enums + availability
 */
export type AvailabilityStatus = "available" | "cancelled" | "consumed";

export interface SchedulerEvent {
  id: string;
  teacherId: string | null;
  start: Date;
  end: Date;
  title: string;
  status: "available" | "bookable" | "unassigned" | "booked" | "cancelled" | "consu
}
  interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  cost_per_hour: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  booking_url?: string;
  terms_url?: string;
  notes?: string;
}

interface VenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueSaved: () => void;
  editingVenue?: Venue | null;
}