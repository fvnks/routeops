"use client";

import { useState } from "react";

interface RestrictionFormProps {
  initial?: any;
  driverId: string;
  onSave: () => void;
}

export function RestrictionForm({ initial, driverId, onSave }: RestrictionFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    canNational: initial?.canNational ?? true,
    canInternational: initial?.canInternational ?? false,
    restrictedRoutes: initial?.restrictedRoutes || "",
    maxConsecutiveDays: initial?.maxConsecutiveDays || 12,
    minRestHours: initial?.minRestHours || 10,
    unavailableDays: initial?.unavailableDays || "",
  });

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/drivers/${driverId}/restrictions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSave();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Días Consecutivos</label>
          <input type="number" value={form.maxConsecutiveDays} onChange={(e) => set("maxConsecutiveDays", +e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mín. Horas Descanso</label>
          <input type="number" value={form.minRestHours} onChange={(e) => set("minRestHours", +e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rutas Restringidas</label>
          <input value={form.restrictedRoutes} onChange={(e) => set("restrictedRoutes", e.target.value)}
            placeholder="Separadas por coma"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar Restricciones"}
      </button>
    </form>
  );
}
