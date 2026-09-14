"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
          <p className="text-gray-500">{routes.length} rutas configuradas</p>
        </div>
        <Link href="/routes/new" className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
          + Nueva Ruta
        </Link>
      </div>

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
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : routes.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay rutas configuradas</td></tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{route.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.origin}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{route.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      route.type === "INTERNATIONAL" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {route.type === "INTERNATIONAL" ? "Internacional" : "Nacional"}
                    </span>
                  </td>
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
