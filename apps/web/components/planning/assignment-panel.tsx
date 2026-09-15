"use client";

import { useState, useEffect } from "react";

interface AssignmentPanelProps {
  tripId: string | null;
  onClose: () => void;
}

export function AssignmentPanel({ tripId, onClose }: AssignmentPanelProps) {
  const [trip, setTrip] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!tripId) return;
    fetch(`/api/trips/${tripId}`).then(r => r.json()).then(setTrip);
    fetch("/api/drivers?status=ACTIVE").then(r => r.json()).then(d => setDrivers(d.data || []));
    fetch("/api/buses?status=AVAILABLE").then(r => r.json()).then(d => setBuses(d.data || []));
  }, [tripId]);

  if (!tripId) return null;

  async function handleAssign() {
    setLoading(true);
    setErrors([]);
    const res = await fetch(`/api/trips/${tripId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId, busId }),
    });
    const data = await res.json();
    if (data.validation && !data.validation.valid) {
      setErrors(data.validation.errors.map((e: any) => e.message));
    } else {
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Asignar Viaje</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      {trip && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">{trip.route?.origin} → {trip.route?.destination}</p>
          <p className="text-xs text-gray-500">{trip.tripNumber}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="">Seleccionar</option>
            {drivers.map((d: any) => (
              <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
          <select value={busId} onChange={(e) => setBusId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="">Seleccionar</option>
            {buses.map((b: any) => (
              <option key={b.id} value={b.id}>{b.plateNumber}</option>
            ))}
          </select>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            {errors.map((e, i) => <p key={i} className="text-xs text-red-700">• {e}</p>)}
          </div>
        )}

        <button onClick={handleAssign} disabled={loading || !driverId || !busId}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Asignando..." : "Asignar"}
        </button>
      </div>
    </div>
  );
}
