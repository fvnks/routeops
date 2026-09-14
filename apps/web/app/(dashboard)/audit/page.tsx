"use client";

import { useEffect, useState } from "react";

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
    CREATE: "Crear",
    UPDATE: "Actualizar",
    DELETE: "Eliminar",
    ASSIGN: "Asignar",
    UNASSIGN: "Desasignar",
    STATUS_CHANGE: "Cambio de estado",
    IMPORT: "Importar",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
        <p className="text-gray-500">Historial de cambios en el sistema</p>
      </div>

      <div className="flex gap-4">
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay registros de auditoría</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(log.createdAt).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.user?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.entityType} · {log.entityId?.substring(0, 8)}...</td>
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
