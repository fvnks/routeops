"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingRow, LoadingPage } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { DriverStatusBadge } from "@/components/shared/status-badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchDrivers(); }, [search, statusFilter]);

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

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/drivers/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchDrivers();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Conductores" subtitle={`${drivers.length} conductores registrados`} action={{ label: "+ Nuevo Conductor", href: "/drivers/new" }} />

      <div className="flex gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o licencia..." className="flex-1" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
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
              <LoadingRow colSpan={7} />
            ) : drivers.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title="No hay conductores" action={{ label: "Crear conductor", href: "/drivers/new" }} /></td></tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{driver.firstName} {driver.lastName}</p>
                    <p className="text-sm text-gray-500">{driver.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver.licenseNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver.baseLocation}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {driver.canNational && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">NAC</span>}
                      {driver.canInternational && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">INT</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><DriverStatusBadge status={driver.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{driver._count?.assignments || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/drivers/${driver.id}`} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Editar</Link>
                      {driver.status === "ACTIVE" && (
                        <button onClick={() => setDeleteId(driver.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Desactivar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog open={!!deleteId} title="Desactivar conductor" message="¿Estás seguro de desactivar este conductor? No podrá ser asignado a viajes." variant="danger" confirmLabel="Desactivar" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
