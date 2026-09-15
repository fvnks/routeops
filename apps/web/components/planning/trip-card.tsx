import { formatTime, formatDate } from "@/lib/utils";
import { TRIP_STATUS_COLORS } from "@/lib/constants";
import type { TripWithDetails } from "@/types";

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

interface TripCardProps {
  trip: TripWithDetails;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const hasAssignment = trip.assignments.length > 0;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${
        hasAssignment ? "border-green-200 bg-green-50/50" : "border-orange-200 bg-orange-50/50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-gray-500">{formatTime(trip.departureTime)}</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TRIP_STATUS_COLORS[trip.status] || "bg-gray-100 text-gray-800"}`}>
          {etiquetas[trip.status] || trip.status}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-900">
        {trip.route.origin} → {trip.route.destination}
      </p>
      {hasAssignment ? (
        <p className="text-xs text-gray-500 mt-1">
          {trip.assignments[0].driver.firstName} {trip.assignments[0].driver.lastName} · {trip.assignments[0].bus.plateNumber}
        </p>
      ) : (
        <p className="text-xs text-orange-600 mt-1 font-medium">Sin asignar</p>
      )}
    </div>
  );
}
