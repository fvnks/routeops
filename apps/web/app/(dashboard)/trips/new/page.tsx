"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTripPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    routeId: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    departureTime: "06:00",
    tripType: "NATIONAL" as "NATIONAL" | "INTERNATIONAL",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/routes").then((r) => r.json()).then(setRoutes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const [hours, minutes] = form.departureTime.split(":").map(Number);
    const departureDateTime = new Date(form.scheduledDate);
    departureDateTime.setHours(hours, minutes, 0, 0);

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routeId: form.routeId,
        scheduledDate: form.scheduledDate,
        departureTime: departureDateTime.toISOString(),
        tripType: form.tripType,
        notes: form.notes,
      }),
    });
    setLoading(false);
    if (res.ok) router.push("/trips");
    else {
      const data = await res.json();
      setError(data.error || "Error al crear viaje");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Viaje</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ruta *</label>
          <select value={form.routeId} onChange={(e) => {
            const route = routes.find((r) => r.id === e.target.value);
            setForm({ ...form, routeId: e.target.value, tripType: route?.type || form.tripType });
          }} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
            <option value="">Seleccionar ruta</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.code} — {r.name} ({r.type === "INTERNATIONAL" ? "INT" : "NAC"})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de salida *</label>
            <select value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
              {["05:30","06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">{loading ? "Guardando..." : "Crear Viaje"}</button>
        </div>
      </form>
    </div>
  );
}
