"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BusFormProps {
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
}

export function BusForm({ initial, onSubmit }: BusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plateNumber: initial?.plateNumber || "",
    internalCode: initial?.internalCode || "",
    brand: initial?.brand || "",
    model: initial?.model || "",
    year: initial?.year || new Date().getFullYear(),
    capacity: initial?.capacity || 20,
    hasAC: initial?.hasAC ?? true,
    hasWiFi: initial?.hasWiFi ?? false,
    hasBathroom: initial?.hasBathroom ?? false,
    status: initial?.status || "AVAILABLE",
  });

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      router.push("/buses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Bus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
            <input required value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código Interno</label>
            <input value={form.internalCode} onChange={(e) => set("internalCode", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input value={form.model} onChange={(e) => set("model", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input type="number" value={form.year} onChange={(e) => set("year", +e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad *</label>
            <input type="number" required value={form.capacity} onChange={(e) => set("capacity", +e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="AVAILABLE">Disponible</option>
              <option value="IN_MAINTENANCE">Mantenimiento</option>
              <option value="RESERVED">Reservado</option>
              <option value="RETIRED">Retirado</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.hasAC} onChange={(e) => set("hasAC", e.target.checked)} className="rounded border-gray-300" />
              Aire Acondicionado
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.hasWiFi} onChange={(e) => set("hasWiFi", e.target.checked)} className="rounded border-gray-300" />
              WiFi
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.hasBathroom} onChange={(e) => set("hasBathroom", e.target.checked)} className="rounded border-gray-300" />
              Baño
            </label>
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
          {loading ? "Guardando..." : initial ? "Actualizar" : "Crear Bus"}
        </button>
      </div>
    </form>
  );
}
