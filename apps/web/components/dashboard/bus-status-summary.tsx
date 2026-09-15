import type { BusStatus } from "@/types";

interface BusStatusSummaryProps {
  total: number;
  available: number;
  inMaintenance: number;
  reserved: number;
  retired: number;
}

export function BusStatusSummary({
  total,
  available,
  inMaintenance,
  reserved,
  retired,
}: BusStatusSummaryProps) {
  const items = [
    { label: "Disponible", count: available, color: "bg-green-500" },
    { label: "Mantenimiento", count: inMaintenance, color: "bg-yellow-500" },
    { label: "Reservado", count: reserved, color: "bg-blue-500" },
    { label: "Retirado", count: retired, color: "bg-gray-400" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado Buses</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">{item.count}</span>
            </div>
            <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{ width: total > 0 ? `${(item.count / total) * 100}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
