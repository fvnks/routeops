"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingRow } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { RouteTypeBadge } from "@/components/shared/status-badges";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRoutes(); }, []);

  async function fetchRoutes() {
    const res = await fetch("/api/routes");
    const data = await res.json();
    setRoutes(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Rutas" subtitle={`${routes.length} rutas configuradas`} action={{ label: "+ Nueva Ruta", href: "/routes/new" }} />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viajes</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingRow colSpan={8} />
            ) : routes.length === 0 ? (
              <tr><td colSpan={8}><EmptyState title="No hay rutas" action={{ label: "Crear ruta", href: "/routes/new" }} /></td></tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{route.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.origin}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.destination}</td>
                  <td className="px-4 py-3"><RouteTypeBadge type={route.type} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}min</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route._count?.trips || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/routes/${route.id}`} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Editar</Link>
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
