import { formatTime } from "@/lib/utils";
import { TRIP_STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { TripWithDetails } from "@/types";

interface TripsTodayProps {
  trips: TripWithDetails[];
}

export function TripsToday({ trips }: TripsTodayProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Viajes de Hoy</h2>
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500">No hay viajes programados para hoy</p>
      ) : (
        <div className="space-y-3">
          {trips.slice(0, 10).map((trip) => (
            <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-gray-500">{formatTime(trip.departureTime)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {trip.route.origin} → {trip.route.destination}
                  </p>
                  <p className="text-xs text-gray-500">
                    {trip.assignments.length > 0
                      ? `${trip.assignments[0].driver.firstName} ${trip.assignments[0].driver.lastName}`
                      : "Sin asignar"}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TRIP_STATUS_COLORS[trip.status] || "bg-gray-100 text-gray-800"}`}>
                {STATUS_LABELS[trip.status] || trip.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
