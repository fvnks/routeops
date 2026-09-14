"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"info" | "restrictions" | "vacations">("info");

  useEffect(() => {
    fetchDriver();
  }, [params.id]);

  async function fetchDriver() {
    const res = await fetch(`/api/drivers/${params.id}`);
    if (res.ok) {
      setDriver(await res.json());
    }
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/drivers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      fetchDriver();
    } else {
      const d = await res.json();
      setError(d.error || "Error al guardar");
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  if (!driver) return <div className="text-center py-8 text-gray-500">Conductor no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h1>
          <p className="text-gray-500">{driver.licenseNumber} · {driver.baseLocation}</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{error}</div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {(["info", "restrictions", "vacations"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "info" ? "Información" : t === "restrictions" ? "Restricciones" : "Vacaciones"}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <InfoTab driver={driver} onSave={handleUpdate} saving={saving} />
      )}
      {tab === "restrictions" && (
        <RestrictionsTab driver={driver} onSave={handleUpdate} saving={saving} />
      )}
      {tab === "vacations" && (
        <VacationsTab driver={driver} onRefresh={fetchDriver} />
      )}
    </div>
  );
}

function InfoTab({ driver, onSave, saving }: { driver: any; onSave: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    firstName: driver.firstName,
    lastName: driver.lastName,
    phone: driver.phone || "",
    email: driver.email || "",
    baseLocation: driver.baseLocation,
    canNational: driver.canNational,
    canInternational: driver.canInternational,
    status: driver.status,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
        <select value={form.baseLocation} onChange={(e) => setForm({ ...form, baseLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500">
          <option value="Santiago">Santiago</option>
          <option value="San Felipe">San Felipe</option>
          <option value="Los Andes">Los Andes</option>
          <option value="Mendoza">Mendoza</option>
          <option value="Buenos Aires">Buenos Aires</option>
        </select>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.canNational} onChange={(e) => setForm({ ...form, canNational: e.target.checked })} className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">Nacional</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.canInternational} onChange={(e) => setForm({ ...form, canInternational: e.target.checked })} className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">Internacional</span>
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

function RestrictionsTab({ driver, onSave, saving }: { driver: any; onSave: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    minRestHours: driver.restrictions?.minRestHours || 10,
    maxConsecutiveDays: driver.restrictions?.maxConsecutiveDays || 6,
    restrictedRoutes: driver.restrictions?.restrictedRoutes || [],
    unavailableDays: driver.restrictions?.unavailableDays || [],
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descanso mínimo (horas)</label>
          <input type="number" value={form.minRestHours} onChange={(e) => setForm({ ...form, minRestHours: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" min={1} max={24} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máx. días consecutivos</label>
          <input type="number" value={form.maxConsecutiveDays} onChange={(e) => setForm({ ...form, maxConsecutiveDays: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" min={1} max={14} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rutas restringidas</label>
        <input type="text" value={form.restrictedRoutes.join(", ")} onChange={(e) => setForm({ ...form, restrictedRoutes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="Separar por comas: Mendoza, Buenos Aires" />
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Restricciones"}
        </button>
      </div>
    </div>
  );
}

function VacationsTab({ driver, onRefresh }: { driver: any; onRefresh: () => void }) {
  const [vacations, setVacations] = useState(driver.vacations || []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });

  async function handleAdd() {
    const res = await fetch(`/api/drivers/${driver.id}/vacations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ startDate: "", endDate: "", reason: "" });
      onRefresh();
    }
  }

  async function handleDelete(vacationId: string) {
    if (!confirm("¿Eliminar esta vacación?")) return;
    await fetch(`/api/drivers/${driver.id}/vacations?vacationId=${vacationId}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Vacaciones Programadas</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-slate-600 hover:text-slate-900 font-medium">
          {showForm ? "Cancelar" : "+ Agregar"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha término</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Opcional" />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm">Guardar</button>
        </div>
      )}

      {vacations.length === 0 ? (
        <p className="text-sm text-gray-500">No hay vacaciones programadas</p>
      ) : (
        <div className="space-y-2">
          {vacations.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(v.startDate).toLocaleDateString("es-CL")} — {new Date(v.endDate).toLocaleDateString("es-CL")}
                </p>
                {v.reason && <p className="text-xs text-gray-500">{v.reason}</p>}
              </div>
              <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-900 text-sm">Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
