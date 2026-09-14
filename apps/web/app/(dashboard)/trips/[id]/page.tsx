"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    fetchTrip();
    fetch("/api/drivers?status=ACTIVE&limit=100").then((r) => r.json()).then((d) => setDrivers(d.data || []));
    fetch("/api/buses?status=AVAILABLE&limit=100").then((r) => r.json()).then((d) => setBuses(d.data || []));
  }, [params.id]);

  async function fetchTrip() {
    const res = await fetch(`/api/trips/${params.id}`);
    if (res.ok) setTrip(await res.json());
    setLoading(false);
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
      setValidationResult(data.validation || { errors: [{ message: data.error }] });
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  if (!trip) return <div className="text-center py-8 text-gray-500">Viaje no encontrado</div>;

  const assignment = trip.assignments?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{trip.tripNumber}</h1>
          <p className="text-gray-500">{trip.route?.origin} → {trip.route?.destination}</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Información del Viaje</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Fecha:</span><span>{new Date(trip.scheduledDate).toLocaleDateString("es-CL")}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Salida:</span><span>{new Date(trip.departureTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Llegada:</span><span>{trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tipo:</span><span>{trip.tripType}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Estado:</span><span>{trip.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Duración:</span><span>{trip.route?.estimatedDuration ? `${Math.floor(trip.route.estimatedDuration / 60)}h ${trip.route.estimatedDuration % 60}min` : "—"}</span></div>
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

          {validationResult && validationResult.errors && validationResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Errores de validación:</p>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {validationResult.errors.map((e: any, i: number) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult?.warnings?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm font-medium text-yellow-800 mb-1">Advertencias:</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {validationResult.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
              <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Seleccionar conductor</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.baseLocation}) {d.canInternational ? "INT" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
              <select value={selectedBus} onChange={(e) => setSelectedBus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Seleccionar bus</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>{b.plateNumber} ({b.busType})</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleAssign} disabled={!selectedDriver || !selectedBus || assigning} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">
            {assigning ? "Validando..." : "Asignar"}
          </button>
        </div>
      )}
    </div>
  );
}
