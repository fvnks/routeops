"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
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

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
          <p className="text-gray-500">{trips.length} viajes para {date}</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
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
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay viajes para esta fecha</td></tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{trip.tripNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(trip.departureTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{trip.route?.origin} → {trip.route?.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      trip.tripType === "INTERNATIONAL" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {trip.tripType === "INTERNATIONAL" ? "INT" : "NAC"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {trip.assignments?.[0]?.driver
                      ? `${trip.assignments[0].driver.firstName} ${trip.assignments[0].driver.lastName}`
                      : <span className="text-red-500 font-medium">Sin asignar</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {trip.assignments?.[0]?.bus
                      ? trip.assignments[0].bus.plateNumber
                      : <span className="text-red-500 font-medium">Sin asignar</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[trip.status] || ""}`}>
                      {trip.status}
                    </span>
                  </td>
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
