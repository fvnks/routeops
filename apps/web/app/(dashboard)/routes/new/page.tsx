"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRoutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "NATIONAL" as "NATIONAL" | "INTERNATIONAL",
    origin: "",
    destination: "",
    stops: [] as string[],
    estimatedDuration: 120,
    distanceKm: 0,
    basePrice: 0,
  });
  const [stopInput, setStopInput] = useState("");

  function addStop() {
    if (stopInput.trim()) {
      setForm({ ...form, stops: [...form.stops, stopInput.trim()] });
      setStopInput("");
    }
  }

  function removeStop(index: number) {
    setForm({ ...form, stops: form.stops.filter((_, i) => i !== index) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push("/routes");
    else {
      const data = await res.json();
      setError(data.error || "Error al crear ruta");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Ruta</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Santiago → Mendoza" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="SCL-MDZ" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="NATIONAL">Nacional</option>
            <option value="INTERNATIONAL">Internacional</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
            <input type="text" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
            <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paradas intermedias</label>
          <div className="flex gap-2">
            <input type="text" value={stopInput} onChange={(e) => setStopInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStop())} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Agregar parada y presionar Enter" />
            <button type="button" onClick={addStop} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Agregar</button>
          </div>
          {form.stops.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.stops.map((stop, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                  {stop}
                  <button type="button" onClick={() => removeStop(i)} className="text-gray-500 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min) *</label>
            <input type="number" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" min={1} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distancia (km)</label>
            <input type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio base</label>
            <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" min={0} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">{loading ? "Guardando..." : "Crear Ruta"}</button>
        </div>
      </form>
    </div>
  );
}
