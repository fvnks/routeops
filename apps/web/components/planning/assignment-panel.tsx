"use client";

interface AssignmentPanelProps {
  trip: {
    id: string;
    tripNumber: string;
    departureTime: string;
    arrivalTime: string | null;
    route: {
      origin: string;
      destination: string;
      estimatedDuration: number;
    };
    assignments: {
      id: string;
      driver: {
        firstName: string;
        lastName: string;
      };
      bus: {
        plateNumber: string;
        internalCode: string | null;
      };
    }[];
  };
  drivers: {
    id: string;
    firstName: string;
    lastName: string;
    baseLocation: string;
    canInternational: boolean;
  }[];
  buses: {
    id: string;
    plateNumber: string;
    internalCode: string | null;
    busType: string;
    capacity: number;
  }[];
  onAssign: (driverId: string, busId: string) => void;
  onRemoveAssignment: (assignmentId: string) => void;
  onCancel: () => void;
  isAssigning: boolean;
}

export function AssignmentPanel({
  trip,
  drivers,
  buses,
  onAssign,
  onRemoveAssignment,
  onCancel,
  isAssigning,
}: AssignmentPanelProps) {
  const hasAssignment = trip.assignments.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Asignación de Viaje</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-500">Viaje {trip.tripNumber}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">
          {trip.route.origin} → {trip.route.destination}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {trip.departureTime.slice(11, 16)} - {trip.arrivalTime?.slice(11, 16) || "?"} · {trip.route.estimatedDuration}min
        </p>
      </div>

      {hasAssignment ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="text-xs text-green-600 font-medium">Asignado</p>
              <p className="text-sm text-gray-900 mt-0.5">
                {trip.assignments[0].driver.firstName} {trip.assignments[0].driver.lastName}
              </p>
              <p className="text-xs text-gray-500">{trip.assignments[0].bus.plateNumber}</p>
            </div>
            <button
              onClick={() => onRemoveAssignment(trip.assignments[0].id)}
              className="text-red-500 hover:text-red-700 text-xs font-medium"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Conductor</label>
            <select id="driver-select" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar conductor...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.firstName} {d.lastName} ({d.baseLocation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bus</label>
            <select id="bus-select" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar bus...</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.plateNumber} {b.internalCode ? `(${b.internalCode})` : ""} · {b.busType}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const driverId = (document.getElementById("driver-select") as HTMLSelectElement)?.value;
              const busId = (document.getElementById("bus-select") as HTMLSelectElement)?.value;
              if (driverId && busId) onAssign(driverId, busId);
            }}
            disabled={isAssigning}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAssigning ? "Asignando..." : "Asignar Viaje"}
          </button>
        </div>
      )}
    </div>
  );
}
