import { TRIP_STATUS_COLORS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";
import type { TripStatus, TripType } from "@/types";

interface DriverStatusBadgeProps {
  status: string;
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    SUSPENDED: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    SUSPENDED: "Suspendido",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {labels[status] || status}
    </span>
  );
}

export function BusStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800",
    IN_MAINTENANCE: "bg-yellow-100 text-yellow-800",
    RETIRED: "bg-gray-100 text-gray-800",
    RESERVED: "bg-blue-100 text-blue-800",
  };
  const labels: Record<string, string> = {
    AVAILABLE: "Disponible",
    IN_MAINTENANCE: "Mantenimiento",
    RETIRED: "Retirado",
    RESERVED: "Reservado",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {labels[status] || status}
    </span>
  );
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const etiquetas: Record<string, string> = {
    SCHEDULED: "Programado",
    CONFIRMED: "Confirmado",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    RESCHEDULED: "Reprogramado",
    CONTINGENCY_AFFECTED: "Afectado Contingencia",
    PENDING_REPLACEMENT: "Pendiente Reemplazo",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TRIP_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
      {etiquetas[status] || status}
    </span>
  );
}

export function RouteTypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      type === "NATIONAL" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
    }`}>
      {type === "NATIONAL" ? "NAC" : "INT"}
    </span>
  );
}
