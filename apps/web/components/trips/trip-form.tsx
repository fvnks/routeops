"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/lib/constants";

interface TripFormProps {
  initial?: any;
  routes: { id: string; name: string; code: string; origin: string; destination: string }[];
  onSubmit: (data: any) => Promise<void>;
}

export function TripForm({ initial, routes, onSubmit }: TripFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    routeId: initial?.routeId || "",
    scheduledDate: initial?.scheduledDate ? initial.scheduledDate.split("T")[0] : "",
    departureTime: initial?.departureTime || "",
    tripType: initial?.tripType || "NATIONAL",
    notes: initial?.notes || "",
  });

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      router.push("/trips");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Viaje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ruta *</label>
            <select required value={form.routeId} onChange={(e) => set("routeId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="">Seleccionar ruta</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.code} — {r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input required type="date" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Salida *</label>
            <input required value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)}
              placeholder="HH:MM"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select value={form.tripType} onChange={(e) => set("tripType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="NATIONAL">Nacional</option>
              <option value="INTERNATIONAL">Internacional</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" rows={2} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Guardando..." : initial ? "Actualizar" : "Crear Viaje"}
        </button>
      </div>
    </form>
  );
}
