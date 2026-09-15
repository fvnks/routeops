"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/lib/constants";

interface RouteFormProps {
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
}

export function RouteForm({ initial, onSubmit }: RouteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<{ name: string; km: number; order: number }[]>(
    initial?.stops || []
  );
  const [form, setForm] = useState({
    code: initial?.code || "",
    name: initial?.name || "",
    type: initial?.type || "NATIONAL",
    origin: initial?.origin || "",
    destination: initial?.destination || "",
    estimatedDuration: initial?.estimatedDuration || 120,
    active: initial?.active ?? true,
  });

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addStop() {
    setStops([...stops, { name: "", km: 0, order: stops.length }]);
  }

  function updateStop(i: number, field: string, value: any) {
    const next = [...stops];
    (next[i] as any)[field] = value;
    setStops(next);
  }

  function removeStop(i: number) {
    setStops(stops.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...form, stops });
      router.push("/routes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Ruta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
            <input required value={form.code} onChange={(e) => set("code", e.target.value)}
              placeholder="ej: SF-SAN-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="NATIONAL">Nacional</option>
              <option value="INTERNATIONAL">Internacional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración Est. (min) *</label>
            <input required type="number" value={form.estimatedDuration} onChange={(e) => set("estimatedDuration", +e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
            <select required value={form.origin} onChange={(e) => set("origin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="">Seleccionar</option>
              {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
            <select required value={form.destination} onChange={(e) => set("destination", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="">Seleccionar</option>
              {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Paradas</h2>
          <button type="button" onClick={addStop}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium">+ Agregar</button>
        </div>
        {stops.length === 0 ? (
          <p className="text-sm text-gray-500">Sin paradas intermedias</p>
        ) : (
          <div className="space-y-2">
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                <input value={stop.name} onChange={(e) => updateStop(i, "name", e.target.value)}
                  placeholder="Nombre parada" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <input type="number" value={stop.km} onChange={(e) => updateStop(i, "km", +e.target.value)}
                  placeholder="Km" className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <button type="button" onClick={() => removeStop(i)}
                  className="text-red-500 hover:text-red-700 text-sm">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Guardando..." : initial ? "Actualizar" : "Crear Ruta"}
        </button>
      </div>
    </form>
  );
}
