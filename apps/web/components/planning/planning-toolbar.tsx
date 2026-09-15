"use client";

interface PlanningToolbarProps {
  startDate: string;
  onDateChange: (date: string) => void;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
  filter: "all" | "unassigned" | "conflicts";
  onFilterChange: (filter: "all" | "unassigned" | "conflicts") => void;
  stats?: {
    totalTrips: number;
    assigned: number;
    unassigned: number;
    conflicts: number;
  };
}

export function PlanningToolbar({
  startDate,
  onDateChange,
  onNavigate,
  onToday,
  filter,
  onFilterChange,
  stats,
}: PlanningToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Semana anterior"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => onNavigate(1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Semana siguiente"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <input
          type="date"
          value={startDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => onFilterChange("unassigned")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 ${
              filter === "unassigned"
                ? "bg-orange-50 text-orange-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Sin asignar
          </button>
          <button
            onClick={() => onFilterChange("conflicts")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 ${
              filter === "conflicts"
                ? "bg-red-50 text-red-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Conflictos
          </button>
        </div>

        {stats && (
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
            <div className="text-sm">
              <span className="text-gray-500">Total:</span>{" "}
              <span className="font-medium text-gray-900">{stats.totalTrips}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Asignados:</span>{" "}
              <span className="font-medium text-green-600">{stats.assigned}</span>
            </div>
            {stats.unassigned > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Sin asignar:</span>{" "}
                <span className="font-medium text-orange-600">{stats.unassigned}</span>
              </div>
            )}
            {stats.conflicts > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Conflictos:</span>{" "}
                <span className="font-medium text-red-600">{stats.conflicts}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
