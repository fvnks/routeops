"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { StatsCards, TypeBreakdown } from "@/components/contingencies/stats-cards";

interface ContingencyStats {
  total: number;
  resolved: number;
  unresolved: number;
  avgResolutionTime: number;
  recoveryRate: number;
  byType: {
    DRIVER_ABSENCE: number;
    BUS_BREAKDOWN: number;
    ROUTE_DISRUPTION: number;
    DEMAND_SURGE: number;
  };
  bySeverity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  byResolution: {
    REASSIGNED: number;
    CANCELLED: number;
    DELAYED: number;
    COVERED_EXTRABOARD: number;
    COVERED_OVERTIME: number;
  };
}

export default function ContingencyStatsPage() {
  const [stats, setStats] = useState<ContingencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  async function fetchStats() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("from", dateRange.from);
    params.set("to", dateRange.to);
    const res = await fetch(`/api/contingencies/stats?${params}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métricas de Contingencias"
        subtitle="Análisis de fallas y resolución de incidentes"
      />

      <div className="flex gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingPage />
      ) : stats ? (
        <>
          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TypeBreakdown stats={stats} />

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Severidad</h3>
              <div className="space-y-3">
                {[
                  { key: "CRITICAL", label: "🔴 Crítico", color: "bg-red-500" },
                  { key: "HIGH", label: "🟠 Alto", color: "bg-orange-500" },
                  { key: "MEDIUM", label: "🟡 Medio", color: "bg-yellow-500" },
                  { key: "LOW", label: "🔵 Bajo", color: "bg-blue-500" },
                ].map((s) => {
                  const count = stats.bySeverity[s.key as keyof typeof stats.bySeverity] || 0;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={s.key}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{s.label}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Resolución</h3>
              <div className="space-y-3">
                {[
                  { key: "REASSIGNED", label: "Reasignado", color: "bg-green-500" },
                  { key: "CANCELLED", label: "Cancelado", color: "bg-red-500" },
                  { key: "DELAYED", label: "Reprogramado", color: "bg-yellow-500" },
                  { key: "COVERED_EXTRABOARD", label: "Cubierto (Extraboard)", color: "bg-blue-500" },
                  { key: "COVERED_OVERTIME", label: "Cubierto (Overtime)", color: "bg-purple-500" },
                ].map((r) => {
                  const count = stats.byResolution[r.key as keyof typeof stats.byResolution] || 0;
                  const pct = stats.resolved > 0 ? (count / stats.resolved) * 100 : 0;
                  return (
                    <div key={r.key}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{r.label}</span>
                        <span className="font-medium text-gray-900">{count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${r.color} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
