"use client";

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
}

interface StatsCardsProps {
  stats: ContingencyStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">🚨</span>
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Total Contingencias</p>
          <p className="text-xs text-gray-500">Últimos 30 días</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">✅</span>
          <span className="text-2xl font-bold text-green-600">{stats.recoveryRate}%</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Tasa de Recuperación</p>
          <p className="text-xs text-gray-500">{stats.resolved} de {stats.total} resueltas</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">⏱️</span>
          <span className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}min</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Tiempo Prom. Resolución</p>
          <p className="text-xs text-gray-500">Desde reporte hasta resolución</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">⏳</span>
          <span className="text-2xl font-bold text-orange-600">{stats.unresolved}</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Sin Resolver</p>
          <p className="text-xs text-gray-500">Contingencias activas</p>
        </div>
      </div>
    </div>
  );
}

export function TypeBreakdown({ stats }: StatsCardsProps) {
  const types = [
    { key: "DRIVER_ABSENCE", label: "👤 Ausencia Conductor", color: "bg-blue-500" },
    { key: "BUS_BREAKDOWN", label: "🚌 Falla Mecánica", color: "bg-orange-500" },
    { key: "ROUTE_DISRUPTION", label: "🚧 Disrupción Ruta", color: "bg-red-500" },
    { key: "DEMAND_SURGE", label: "📈 Demanda Extra", color: "bg-purple-500" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Tipo</h3>
      <div className="space-y-3">
        {types.map((type) => {
          const count = stats.byType[type.key as keyof typeof stats.byType] || 0;
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={type.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{type.label}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
              <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${type.color} rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
