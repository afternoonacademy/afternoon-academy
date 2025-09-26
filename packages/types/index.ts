export type Role = "admin" | "parent" | "student" | "teacher";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  created_at?: string; // ✅ add this
}
