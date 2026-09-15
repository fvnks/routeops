interface StatsCardsProps {
  totalDrivers: number;
  activeDrivers: number;
  totalBuses: number;
  availableBuses: number;
  todayTrips: number;
  assignedTrips: number;
}

export function StatsCards({
  totalDrivers,
  activeDrivers,
  totalBuses,
  availableBuses,
  todayTrips,
  assignedTrips,
}: StatsCardsProps) {
  const unassignedTrips = todayTrips - assignedTrips;
  const assignPct = todayTrips > 0 ? Math.round((assignedTrips / todayTrips) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className={`rounded-lg border p-4 ${unassignedTrips > 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}`}>
        <div className="flex items-center justify-between">
          <span className="text-2xl">🗓️</span>
          <span className="text-2xl font-bold text-gray-900">{todayTrips}</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Viajes Hoy</p>
          <p className="text-xs text-gray-500">{assignedTrips} asignados / {unassignedTrips} sin asignar</p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">👤</span>
          <span className="text-2xl font-bold text-gray-900">{activeDrivers}</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Conductores Activos</p>
          <p className="text-xs text-gray-500">de {totalDrivers} totales</p>
        </div>
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">🚌</span>
          <span className="text-2xl font-bold text-gray-900">{availableBuses}</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Buses Disponibles</p>
          <p className="text-xs text-gray-500">de {totalBuses} totales</p>
        </div>
      </div>

      <div className={`rounded-lg border p-4 ${assignPct === 100 && todayTrips > 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
        <div className="flex items-center justify-between">
          <span className="text-2xl">✅</span>
          <span className="text-2xl font-bold text-gray-900">{assignPct}%</span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900">Asignación</p>
          <p className="text-xs text-gray-500">% viajes asignados</p>
        </div>
      </div>
    </div>
  );
}
