"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    plateNumber: "",
    internalCode: "",
    model: "",
    brand: "",
    year: new Date().getFullYear(),
    capacity: 50,
    hasAC: true,
    hasWifi: false,
    busType: "standard",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push("/buses");
    else {
      const data = await res.json();
      setError(data.error || "Error al crear bus");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Bus</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
            <input type="text" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="ABCD-12" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código Interno</label>
            <input type="text" value={form.internalCode} onChange={(e) => setForm({ ...form, internalCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="B-001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
            <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" min={1990} max={2030} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" min={1} max={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={form.busType} onChange={(e) => setForm({ ...form, busType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="standard">Estándar</option>
              <option value="semi_cama">Semi Cama</option>
              <option value="cama">Cama</option>
              <option value="double_deck">Doble Piso</option>
            </select>
          </div>
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
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">{loading ? "Guardando..." : "Crear Bus"}</button>
        </div>
      </form>
    </div>
  );
}
