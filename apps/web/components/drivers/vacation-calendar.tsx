"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

interface VacationCalendarProps {
  driverId: string;
}

export function VacationCalendar({ driverId }: VacationCalendarProps) {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [driverId]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/drivers/${driverId}/vacations`);
    const data = await res.json();
    setVacations(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/drivers/${driverId}/vacations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ startDate: "", endDate: "", reason: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar vacaciones?")) return;
    await fetch(`/api/drivers/${driverId}/vacations?vacationId=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Períodos de Vacaciones</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="text-sm text-slate-600 hover:text-slate-900 font-medium">
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
              <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Motivo</label>
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : vacations.length === 0 ? (
        <p className="text-sm text-gray-500">No hay vacaciones registradas</p>
      ) : (
        <div className="space-y-2">
          {vacations.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(v.startDate)} — {formatDate(v.endDate)}
                </p>
                {v.reason && <p className="text-xs text-gray-500">{v.reason}</p>}
              </div>
              <button onClick={() => handleDelete(v.id)} className="text-xs text-red-600 hover:text-red-900">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
