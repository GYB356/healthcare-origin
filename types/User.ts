/**
 * User interface definition
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient" | "nurse" | "staff";
  password?: string;
  specialization?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
