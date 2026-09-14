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

export interface TripWithDetails {
  id: string;
  tripNumber: string;
  scheduledDate: string;
  departureTime: string;
  arrivalTime: string | null;
  status: TripStatus;
  tripType: TripType;
  notes: string | null;
  route: {
    id: string;
    name: string;
    code: string;
    origin: string;
    destination: string;
    estimatedDuration: number;
  };
  assignments: {
    id: string;
    driver: {
      id: string;
      firstName: string;
      lastName: string;
      baseLocation: string;
    };
    bus: {
      id: string;
      plateNumber: string;
      internalCode: string | null;
    };
  }[];
}

export interface DaySchedule {
  date: string;
  trips: TripWithDetails[];
  stats: {
    total: number;
    assigned: number;
    unassigned: number;
    conflicts: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string; code: string }[];
  warnings: string[];
}
