"use client";

import { useDraggable } from "@dnd-kit/core";
import { formatTime } from "@/lib/utils";
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: trip.id,
    data: { trip },
  });

  const hasAssignment = trip.assignments.length > 0;
  const isInternational = trip.tripType === "INTERNATIONAL";

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${
        hasAssignment ? "border-green-200 bg-green-50/50 hover:border-green-300" : "border-orange-200 bg-orange-50/50 hover:border-orange-300"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono text-gray-500">{formatTime(trip.departureTime)}</span>
        <div className="flex items-center gap-1">
          {isInternational && (
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-medium rounded">
              INTL
            </span>
          )}
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
              TRIP_STATUS_COLORS[trip.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {etiquetas[trip.status] || trip.status}
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-900">
        {trip.route.origin} → {trip.route.destination}
      </p>

      <div className="mt-2 flex items-center justify-between">
        {hasAssignment ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                {trip.assignments[0].driver.firstName.charAt(0)}
                {trip.assignments[0].driver.lastName.charAt(0)}
              </span>
              <span className="text-xs text-gray-600">
                {trip.assignments[0].driver.firstName} {trip.assignments[0].driver.lastName}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-orange-600 font-medium">Sin asignar</span>
        )}

        {hasAssignment && (
          <span className="text-[10px] text-gray-400 font-mono">
            {trip.assignments[0].bus.plateNumber}
          </span>
        )}
      </div>
    </div>
  );
}
