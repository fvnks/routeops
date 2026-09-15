"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingRow } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { BusStatusBadge } from "@/components/shared/status-badges";

export default function BusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { fetchBuses(); }, [search, statusFilter]);

  async function fetchBuses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/buses?${params}`);
    const data = await res.json();
    setBuses(data.data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Buses" subtitle={`${buses.length} buses registrados`} action={{ label: "+ Nuevo Bus", href: "/buses/new" }} />

      <div className="flex gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por patente, código o modelo..." className="flex-1" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">Todos</option>
          <option value="AVAILABLE">Disponible</option>
          <option value="IN_MAINTENANCE">Mantención</option>
          <option value="RETIRED">Retirado</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca/Modelo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingRow colSpan={6} />
            ) : buses.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title="No hay buses" action={{ label: "Crear bus", href: "/buses/new" }} /></td></tr>
            ) : (
              buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{bus.internalCode || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{bus.plateNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bus.brand} {bus.model}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bus.capacity}</td>
                  <td className="px-4 py-3"><BusStatusBadge status={bus.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/buses/${bus.id}`} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Editar</Link>
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
