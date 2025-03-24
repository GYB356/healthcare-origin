/**
 * Appointment interface definition
 */

// Appointment status enum
export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
  RESCHEDULED = "RESCHEDULED",
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
