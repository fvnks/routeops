"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800",
    IN_MAINTENANCE: "bg-yellow-100 text-yellow-800",
    RETIRED: "bg-gray-100 text-gray-800",
    RESERVED: "bg-blue-100 text-blue-800",
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: "Disponible",
    IN_MAINTENANCE: "Mantención",
    RETIRED: "Retirado",
    RESERVED: "Reservado",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buses</h1>
          <p className="text-gray-500">{buses.length} buses registrados</p>
        </div>
        <Link href="/buses/new" className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
          + Nuevo Bus
        </Link>
      </div>

      <div className="flex gap-4">
        <input type="text" placeholder="Buscar por patente, código o modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : buses.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay buses registrados</td></tr>
            ) : (
              buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{bus.internalCode || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{bus.plateNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bus.brand} {bus.model}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{bus.busType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{bus.capacity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[bus.status] || ""}`}>
                      {statusLabels[bus.status] || bus.status}
                    </span>
                  </td>
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
