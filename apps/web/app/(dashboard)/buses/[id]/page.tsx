"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function BusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBus(); }, [params.id]);

  async function fetchBus() {
    const res = await fetch(`/api/buses/${params.id}`);
    if (res.ok) setBus(await res.json());
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    setSaving(true);
    await fetch(`/api/buses/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    fetchBus();
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  if (!bus) return <div className="text-center py-8 text-gray-500">Bus no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{bus.internalCode || bus.plateNumber}</h1>
          <p className="text-gray-500">{bus.plateNumber} · {bus.brand} {bus.model}</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button>
      </div>

      <BusEditForm bus={bus} onSave={handleUpdate} saving={saving} />
    </div>
  );
}

function BusEditForm({ bus, onSave, saving }: { bus: any; onSave: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    plateNumber: bus.plateNumber,
    internalCode: bus.internalCode || "",
    model: bus.model,
    brand: bus.brand || "",
    year: bus.year || "",
    capacity: bus.capacity,
    hasAC: bus.hasAC,
    hasWifi: bus.hasWifi,
    busType: bus.busType,
    status: bus.status,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
          <input type="text" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código Interno</label>
          <input type="text" value={form.internalCode} onChange={(e) => setForm({ ...form, internalCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
          <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select value={form.busType} onChange={(e) => setForm({ ...form, busType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="standard">Estándar</option>
            <option value="semi_cama">Semi Cama</option>
            <option value="cama">Cama</option>
            <option value="double_deck">Doble Piso</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="AVAILABLE">Disponible</option>
          <option value="IN_MAINTENANCE">Mantención</option>
          <option value="RESERVED">Reservado</option>
          <option value="RETIRED">Retirado</option>
        </select>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.hasAC} onChange={(e) => setForm({ ...form, hasAC: e.target.checked })} className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">Aire Acondicionado</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.hasWifi} onChange={(e) => setForm({ ...form, hasWifi: e.target.checked })} className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">WiFi</span>
        </label>
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
