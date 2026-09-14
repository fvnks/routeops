"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRoute(); }, [params.id]);

  async function fetchRoute() {
    const res = await fetch(`/api/routes/${params.id}`);
    if (res.ok) setRoute(await res.json());
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    setSaving(true);
    await fetch(`/api/routes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    fetchRoute();
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  if (!route) return <div className="text-center py-8 text-gray-500">Ruta no encontrada</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{route.name}</h1>
          <p className="text-gray-500">{route.code}</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button>
      </div>

      <RouteEditForm route={route} onSave={handleUpdate} saving={saving} />
    </div>
  );
}

function RouteEditForm({ route, onSave, saving }: { route: any; onSave: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    name: route.name,
    code: route.code,
    type: route.type,
    origin: route.origin,
    destination: route.destination,
    stops: route.stops || [],
    estimatedDuration: route.estimatedDuration,
    distanceKm: route.distanceKm || 0,
    basePrice: parseFloat(route.basePrice) || 0,
  });
  const [stopInput, setStopInput] = useState("");

  function addStop() {
    if (stopInput.trim()) {
      setForm({ ...form, stops: [...form.stops, stopInput.trim()] });
      setStopInput("");
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
          <input type="text" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
          <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
          <input type="number" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distancia (km)</label>
          <input type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio base</label>
          <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paradas intermedias</label>
        <div className="flex gap-2">
          <input type="text" value={stopInput} onChange={(e) => setStopInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStop())} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Agregar parada" />
          <button type="button" onClick={addStop} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Agregar</button>
        </div>
        {form.stops.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.stops.map((stop: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                {stop}
                <button type="button" onClick={() => setForm({ ...form, stops: form.stops.filter((_: string, j: number) => j !== i) })} className="text-gray-500 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
