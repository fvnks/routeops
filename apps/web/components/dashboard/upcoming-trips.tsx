import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import type { TripWithDetails } from "@/types";

interface UpcomingTripsProps {
  trips: TripWithDetails[];
}

export function UpcomingTrips({ trips }: UpcomingTripsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Próximos Viajes</h2>
        <Link href="/planning" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
          Ver planificación →
        </Link>
      </div>
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500">No hay viajes próximos programados</p>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {trip.route.origin} → {trip.route.destination}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(trip.scheduledDate)} · {formatTime(trip.departureTime)} · {trip.route.name}
                </p>
              </div>
              <Link
                href={`/trips/${trip.id}`}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Ver
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
