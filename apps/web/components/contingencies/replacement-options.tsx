"use client";

import { SeverityBadge, ContingencyStatusBadge, ContingencyTypeBadge } from "./severity-badge";

interface ReplacementOption {
  driverId: string;
  driverName: string;
  busId: string | null;
  busPlate: string | null;
  score: number;
  reasons: string[];
}

interface ReplacementOptionsProps {
  options: ReplacementOption[];
  buses: { busId: string; plateNumber: string; score: number }[];
  onSelect: (driverId: string, busId: string) => void;
  loading?: boolean;
}

export function ReplacementOptions({
  options,
  buses,
  onSelect,
  loading,
}: ReplacementOptionsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscando reemplazos...</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin reemplazos disponibles</h3>
        <p className="text-sm text-gray-500">
          No se encontraron conductores elegibles para cubrir este viaje.
          Considere cancelar o reprogramar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Conductores Disponibles ({options.length})
      </h3>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.driverId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{option.driverName}</span>
                <span className="text-xs text-gray-500">Score: {option.score}</span>
              </div>
              <div className="flex gap-2 mt-1">
                {option.reasons.map((reason, i) => (
                  <span key={i} className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <select
                id={`bus-${option.driverId}`}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                defaultValue={buses[0]?.busId || ""}
              >
                {buses.map((bus) => (
                  <option key={bus.busId} value={bus.busId}>
                    {bus.plateNumber}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const busId = (document.getElementById(`bus-${option.driverId}`) as HTMLSelectElement)?.value;
                  if (busId) onSelect(option.driverId, busId);
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Asignar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
