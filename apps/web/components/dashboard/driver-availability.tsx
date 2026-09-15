import type { DriverStatus } from "@/types";

interface DriverAvailabilityProps {
  drivers: {
    firstName: string;
    lastName: string;
    status: DriverStatus;
    baseLocation: string;
  }[];
}

export function DriverAvailability({ drivers }: DriverAvailabilityProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Disponibilidad Conductores</h2>
      <div className="space-y-2">
        {drivers.slice(0, 8).map((d, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium text-gray-900">{d.firstName} {d.lastName}</p>
              <p className="text-xs text-gray-500">{d.baseLocation}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              d.status === "ACTIVE" ? "bg-green-100 text-green-800"
              : d.status === "INACTIVE" ? "bg-gray-100 text-gray-600"
              : "bg-red-100 text-red-800"
            }`}>
              {d.status === "ACTIVE" ? "Activo" : d.status === "INACTIVE" ? "Inactivo" : "Suspendido"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
