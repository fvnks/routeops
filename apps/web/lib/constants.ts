export const DESTINATIONS = [
  "San Felipe",
  "Los Andes",
  "Santiago",
  "Mendoza",
  "Buenos Aires",
];

export const TIME_SLOTS = [
  "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
  "19:30", "20:00", "20:30", "21:00",
];

export const DRIVER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export const BUS_STATUSES = ["AVAILABLE", "IN_MAINTENANCE", "RETIRED", "RESERVED"] as const;
export const TRIP_STATUSES = [
  "SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED",
  "CANCELLED", "RESCHEDULED", "CONTINGENCY_AFFECTED", "PENDING_REPLACEMENT",
] as const;
export const TRIP_TYPES = ["NATIONAL", "INTERNATIONAL"] as const;

export const TRIP_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  RESCHEDULED: "bg-purple-100 text-purple-800 border-purple-300",
  CONTINGENCY_AFFECTED: "bg-orange-100 text-orange-800 border-orange-300",
  PENDING_REPLACEMENT: "bg-pink-100 text-pink-800 border-pink-300",
};

export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  RESCHEDULED: "Reprogramado",
  CONTINGENCY_AFFECTED: "Afectado Contingencia",
  PENDING_REPLACEMENT: "Pendiente Reemplazo",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
  AVAILABLE: "Disponible",
  IN_MAINTENANCE: "Mantenimiento",
  RETIRED: "Retirado",
  RESERVED: "Reservado",
};

export const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#FCD34D",
  CONFIRMED: "#34D399",
  IN_PROGRESS: "#60A5FA",
  COMPLETED: "#9CA3AF",
  CANCELLED: "#F87171",
  ACTIVE: "#34D399",
  INACTIVE: "#9CA3AF",
  SUSPENDED: "#F87171",
  AVAILABLE: "#34D399",
  IN_MAINTENANCE: "#FCD34D",
  RETIRED: "#9CA3AF",
  RESERVED: "#60A5FA",
};

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

export const BUS_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  IN_MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RETIRED: "bg-gray-100 text-gray-800",
  RESERVED: "bg-blue-100 text-blue-800",
};

export const BUS_TYPES: Record<string, string> = {
  standard: "Standard",
  semi_cama: "Semi Cama",
  cama: "Cama",
};
