"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINATIONS, DRIVER_STATUSES } from "@/lib/constants";

interface DriverFormProps {
  initial?: any;
  onSubmit: (data: any) => Promise<void>;
}

export function DriverForm({ initial, onSubmit }: DriverFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: initial?.firstName || "",
    lastName: initial?.lastName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    licenseNumber: initial?.licenseNumber || "",
    licenseExpiry: initial?.licenseExpiry ? initial.licenseExpiry.split("T")[0] : "",
    baseLocation: initial?.baseLocation || DESTINATIONS[0],
    canNational: initial?.canNational ?? true,
    canInternational: initial?.canInternational ?? false,
    status: initial?.status || "ACTIVE",
  });

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      router.push("/drivers");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
            <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Licencia y Habilitaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N° Licencia *</label>
            <input required value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento Licencia *</label>
            <input required type="date" value={form.licenseExpiry} onChange={(e) => set("licenseExpiry", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base *</label>
            <select value={form.baseLocation} onChange={(e) => set("baseLocation", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
              {DRIVER_STATUSES.map((s) => (
                <option key={s} value={s}>{s === "ACTIVE" ? "Activo" : s === "INACTIVE" ? "Inactivo" : "Suspendido"}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.canNational} onChange={(e) => set("canNational", e.target.checked)}
                className="rounded border-gray-300" />
              Habilitado Nacional
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.canInternational} onChange={(e) => set("canInternational", e.target.checked)}
                className="rounded border-gray-300" />
              Habilitado Internacional
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
          {loading ? "Guardando..." : initial ? "Actualizar" : "Crear Conductor"}
        </button>
      </div>
    </form>
  );
}
