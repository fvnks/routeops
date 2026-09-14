export type TripType = "NATIONAL" | "INTERNATIONAL";
export type DriverStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type BusStatus = "AVAILABLE" | "IN_MAINTENANCE" | "RETIRED" | "RESERVED";
export type TripStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "CONTINGENCY_AFFECTED"
  | "PENDING_REPLACEMENT";

export const DESTINATIONS = [
  "San Felipe",
  "Los Andes",
  "Santiago",
  "Mendoza",
  "Buenos Aires",
] as const;

export const TIME_SLOTS = [
  "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
  "19:30", "20:00", "20:30", "21:00",
] as const;
