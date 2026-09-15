"use client";

import { useState } from "react";

interface ContingencyFormProps {
  tripId?: string;
  driverId?: string;
  busId?: string;
  onSubmit: (data: {
    type: string;
    tripId?: string;
    driverId?: string;
    busId?: string;
    reason: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ContingencyForm({
  tripId,
  driverId,
  busId,
  onSubmit,
  onCancel,
}: ContingencyFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "DRIVER_ABSENCE",
    reason: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        tripId,
        driverId,
        busId,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Contingencia *
        </label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value="DRIVER_ABSENCE">👤 Ausencia de Conductor</option>
          <option value="BUS_BREAKDOWN">🚌 Falla Mecánica de Bus</option>
          <option value="ROUTE_DISRUPTION">🚧 Disrupción en Ruta</option>
          <option value="DEMAND_SURGE">📈 Demanda Inesperada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Razón / Descripción *
        </label>
        <textarea
          required
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          placeholder="Describa la situación..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Reportando..." : "Reportar Contingencia"}
        </button>
      </div>
    </form>
  );
}
