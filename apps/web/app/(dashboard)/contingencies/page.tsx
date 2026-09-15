"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { SeverityBadge, ContingencyStatusBadge, ContingencyTypeBadge } from "@/components/contingencies/severity-badge";
import { ContingencyForm } from "@/components/contingencies/contingency-form";

interface Contingency {
  id: string;
  type: string;
  severity: string;
  status: string;
  reason: string | null;
  reportedAt: string;
  affectedTrip: {
    tripNumber: string;
    route: { origin: string; destination: string };
  } | null;
  affectedDriver: {
    firstName: string;
    lastName: string;
  } | null;
  replacementDriver: {
    firstName: string;
    lastName: string;
  } | null;
}

export default function ContingenciesPage() {
  const [contingencies, setContingencies] = useState<Contingency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    fetchContingencies();
  }, [statusFilter]);

  async function fetchContingencies() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/contingencies?${params}`);
    const data = await res.json();
    setContingencies(data);
    setLoading(false);
  }

  async function handleCreateContingency(data: any) {
    await fetch("/api/contingencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchContingencies();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contingencias"
        subtitle="Gestión de fallas y reemplazos en tiempo real"
        action={{
          label: "+ Reportar Contingencia",
          href: "#",
        }}
      />

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value="">Todas</option>
          <option value="ACTIVE">Activas</option>
          <option value="IN_PROGRESS">En Proceso</option>
          <option value="RESOLVED">Resueltas</option>
        </select>

        <a
          href="/contingencies/stats"
          className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Ver Métricas →
        </a>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva Contingencia</h2>
          <ContingencyForm
            onSubmit={handleCreateContingency}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <LoadingPage />
      ) : contingencies.length === 0 ? (
        <EmptyState
          title="No hay contingencias"
          description="No se han reportado fallas o incidentes"
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viaje Afectado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reemplazo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contingencies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(c.reportedAt).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3">
                    <ContingencyTypeBadge type={c.type} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={c.severity} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.affectedTrip ? (
                      <span>
                        {c.affectedTrip.tripNumber} · {c.affectedTrip.route.origin}→{c.affectedTrip.route.destination}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.affectedDriver
                      ? `${c.affectedDriver.firstName} ${c.affectedDriver.lastName}`
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.replacementDriver
                      ? `${c.replacementDriver.firstName} ${c.replacementDriver.lastName}`
                      : <span className="text-gray-400">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3">
                    <ContingencyStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/contingencies/${c.id}`}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                    >
                      Detalle
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
