"use client";

import { useState, useEffect } from "react";

interface TripAssignDialogProps {
  tripId: string | null;
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function TripAssignDialog({ tripId, open, onClose, onAssigned }: TripAssignDialogProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/drivers?status=ACTIVE").then(r => r.json()).then(d => setDrivers(d.data || []));
    fetch("/api/buses?status=AVAILABLE").then(r => r.json()).then(d => setBuses(d.data || []));
  }, [open]);

  if (!open) return null;

  async function handleAssign() {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/trips/${tripId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId, busId }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.assignment) {
      onAssigned();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Asignar Viaje</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Seleccionar conductor</option>
              {drivers.map((d: any) => (
                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
            <select value={busId} onChange={(e) => setBusId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Seleccionar bus</option>
              {buses.map((b: any) => (
                <option key={b.id} value={b.id}>{b.plateNumber} {b.brand ? `(${b.brand})` : ""}</option>
              ))}
            </select>
          </div>

          {result?.validation && !result.validation.valid && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Errores de validación:</p>
              <ul className="text-xs text-red-700 space-y-1">
                {result.validation.errors.map((err: any, i: number) => (
                  <li key={i}>• {err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancelar
          </button>
          <button onClick={handleAssign} disabled={loading || !driverId || !busId}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
