"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter]);

  async function fetchDrivers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/drivers?${params}`);
    const data = await res.json();
    setDrivers(data.data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de desactivar este conductor?")) return;
    await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    fetchDrivers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conductores</h1>
          <p className="text-gray-500">{drivers.length} conductores registrados</p>
        </div>
        <Link
          href="/drivers/new"
          className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          + Nuevo Conductor
        </Link>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o licencia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="SUSPENDED">Suspendido</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licencia</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Habilitación</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignaciones</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay conductores registrados</td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{driver.firstName} {driver.lastName}</p>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver.licenseNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver.baseLocation}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {driver.canNational && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">NAC</span>
                      )}
                      {driver.canInternational && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">INT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                      driver.status === "INACTIVE" ? "bg-gray-100 text-gray-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {driver.status === "ACTIVE" ? "Activo" : driver.status === "INACTIVE" ? "Inactivo" : "Suspendido"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver._count?.assignments || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/drivers/${driver.id}`}
                        className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                      >
                        Editar
                      </Link>
                      {driver.status === "ACTIVE" && (
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
