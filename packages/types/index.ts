// packages/types/index.ts

export type Role = "admin" | "parent" | "student" | "teacher";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  created_at?: string; // ✅ optional timestamp
}
