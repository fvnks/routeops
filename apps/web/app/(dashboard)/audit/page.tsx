"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingRow } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => { fetchLogs(); }, [entityFilter]);

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams();
    if (entityFilter) params.set("entityType", entityFilter);
    const res = await fetch(`/api/audit?${params}`);
    const data = await res.json();
    setLogs(data.data || []);
    setLoading(false);
  }

  const actionLabels: Record<string, string> = {
    CREATE: "Crear", UPDATE: "Actualizar", DELETE: "Eliminar",
    ASSIGN: "Asignar", UNASSIGN: "Desasignar", STATUS_CHANGE: "Cambio de estado", IMPORT: "Importar",
  };

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800", UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800", ASSIGN: "bg-purple-100 text-purple-800",
    STATUS_CHANGE: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoría" subtitle="Historial de cambios en el sistema" />

      <div className="flex gap-4">
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">Todas las entidades</option>
          <option value="driver">Conductores</option>
          <option value="bus">Buses</option>
          <option value="route">Rutas</option>
          <option value="trip">Viajes</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingRow colSpan={5} />
            ) : logs.length === 0 ? (
              <tr><td colSpan={5}><EmptyState title="No hay registros de auditoría" /></td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(log.createdAt).toLocaleString("es-CL")}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || "bg-gray-100 text-gray-800"}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.entityType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.description || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
