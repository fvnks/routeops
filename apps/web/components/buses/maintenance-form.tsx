"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface MaintenanceFormProps {
  busId: string;
  onSave: () => void;
}

export function MaintenanceForm({ busId, onSave }: MaintenanceFormProps) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "PREVENTIVE",
    description: "",
    startDate: "",
    endDate: "",
    cost: "",
    provider: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/buses/${busId}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cost: form.cost ? +form.cost : undefined }),
    });
    setForm({ type: "PREVENTIVE", description: "", startDate: "", endDate: "", cost: "", provider: "" });
    setShow(false);
    setLoading(false);
    onSave();
  }

  return (
    <div>
      <button onClick={() => setShow(!show)}
        className="text-sm text-slate-600 hover:text-slate-900 font-medium">
        {show ? "Cancelar" : "+ Agregar Mantenimiento"}
      </button>
      {show && (
        <form onSubmit={handleSubmit} className="mt-3 bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="PREVENTIVE">Preventivo</option>
                <option value="CORRECTIVE">Correctivo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
              <input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Costo</label>
              <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={2} />
          </div>
          <button type="submit" disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}
    </div>
  );
}
