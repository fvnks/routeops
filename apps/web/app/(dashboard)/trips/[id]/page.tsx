"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { TripStatusBadge, RouteTypeBadge } from "@/components/shared/status-badges";
import { TripForm } from "@/components/trips/trip-form";
import { AssignmentValidation } from "@/components/trips/assignment-validation";
import { formatDate, formatTime } from "@/lib/utils";
import type { TripWithDetails } from "@/types";

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    fetchTrip();
    fetch("/api/routes").then((r) => r.json()).then((d) => setRoutes(Array.isArray(d) ? d : d.data || []));
    fetch("/api/drivers?status=ACTIVE&limit=100").then((r) => r.json()).then((d) => setDrivers(d.data || []));
    fetch("/api/buses?status=AVAILABLE&limit=100").then((r) => r.json()).then((d) => setBuses(d.data || []));
  }, [params.id]);

  async function fetchTrip() {
    const res = await fetch(`/api/trips/${params.id}`);
    if (res.ok) setTrip(await res.json());
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    await fetch(`/api/trips/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(false);
    fetchTrip();
  }

  async function handleAssign() {
    if (!selectedDriver || !selectedBus) return;
    setAssigning(true);
    setValidationResult(null);
    const res = await fetch(`/api/trips/${params.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId: selectedDriver, busId: selectedBus }),
    });
    const data = await res.json();
    setAssigning(false);
    if (res.ok) {
      fetchTrip();
      setValidationResult(null);
    } else {
      setValidationResult(data.validation || { errors: [{ message: data.error }], warnings: [] });
    }
  }

  if (loading) return <LoadingPage />;
  if (!trip) return <div className="text-center py-8 text-gray-500">Viaje no encontrado</div>;

  const assignment = trip.assignments?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={trip.tripNumber}
        subtitle={`${trip.route.origin} → ${trip.route.destination}`}
        action={
          editing
            ? undefined
            : { label: "Editar Viaje", href: "#", onClick: () => setEditing(true) }
        }
      />

      {editing ? (
        <TripForm initial={trip} routes={routes} onSubmit={handleUpdate} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Información del Viaje</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span>{formatDate(trip.scheduledDate)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Salida:</span><span>{formatTime(trip.departureTime)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tipo:</span><span><RouteTypeBadge type={trip.tripType} /></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Estado:</span><span><TripStatusBadge status={trip.status} /></span></div>
                {trip.notes && <div className="flex justify-between"><span className="text-gray-500">Notas:</span><span className="text-right max-w-[200px]">{trip.notes}</span></div>}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Asignación Actual</h2>
              {assignment ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Conductor:</span><span>{assignment.driver.firstName} {assignment.driver.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Bus:</span><span>{assignment.bus.plateNumber}</span></div>
                </div>
              ) : (
                <p className="text-sm text-red-500 font-medium">Sin asignar</p>
              )}
            </div>
          </div>

          {!assignment && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Asignar Conductor y Bus</h2>

              {validationResult && <AssignmentValidation result={validationResult} />}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                  <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">Seleccionar conductor</option>
                    {drivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.baseLocation})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
                  <select value={selectedBus} onChange={(e) => setSelectedBus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">Seleccionar bus</option>
                    {buses.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.plateNumber} ({b.busType})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button onClick={handleAssign} disabled={!selectedDriver || !selectedBus || assigning}
                className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 text-sm font-medium">
                {assigning ? "Validando..." : "Asignar"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
