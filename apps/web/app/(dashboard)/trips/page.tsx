"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingRow } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { TripStatusBadge, RouteTypeBadge } from "@/components/shared/status-badges";
import { formatDate, formatTime } from "@/lib/utils";
import type { TripWithDetails } from "@/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { fetchTrips(); }, [date]);

  async function fetchTrips() {
    setLoading(true);
    const res = await fetch(`/api/trips?date=${date}&limit=100`);
    const data = await res.json();
    setTrips(data.data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
          <p className="text-gray-500">{trips.length} viajes para {formatDate(date)}</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
          <Link href="/trips/new" className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            + Nuevo Viaje
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Viaje</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingRow colSpan={8} />
            ) : trips.length === 0 ? (
              <tr><td colSpan={8}><EmptyState title="No hay viajes para esta fecha" action={{ label: "Crear viaje", href: "/trips/new" }} /></td></tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{trip.tripNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatTime(trip.departureTime)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{trip.route.origin} → {trip.route.destination}</td>
                  <td className="px-4 py-3"><RouteTypeBadge type={trip.tripType} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {trip.assignments?.[0]?.driver
                      ? `${trip.assignments[0].driver.firstName} ${trip.assignments[0].driver.lastName}`
                      : <span className="text-red-500 font-medium">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {trip.assignments?.[0]?.bus
                      ? trip.assignments[0].bus.plateNumber
                      : <span className="text-red-500 font-medium">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3"><TripStatusBadge status={trip.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/trips/${trip.id}`} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Detalle</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
