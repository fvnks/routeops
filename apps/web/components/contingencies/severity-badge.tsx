"use client";

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Crítico", color: "text-red-800", bg: "bg-red-100 border-red-300" },
  HIGH: { label: "Alto", color: "text-orange-800", bg: "bg-orange-100 border-orange-300" },
  MEDIUM: { label: "Medio", color: "text-yellow-800", bg: "bg-yellow-100 border-yellow-300" },
  LOW: { label: "Bajo", color: "text-blue-800", bg: "bg-blue-100 border-blue-300" },
};

interface SeverityBadgeProps {
  severity: string;
  size?: "sm" | "md";
}

export function SeverityBadge({ severity, size = "sm" }: SeverityBadgeProps) {
  const config = severityConfig[severity] || severityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${
        config.bg} ${config.color} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {config.label}
    </span>
  );
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Activa", color: "text-red-800", bg: "bg-red-100" },
  IN_PROGRESS: { label: "En Proceso", color: "text-yellow-800", bg: "bg-yellow-100" },
  RESOLVED: { label: "Resuelta", color: "text-green-800", bg: "bg-green-100" },
  CANCELLED: { label: "Cancelada", color: "text-gray-800", bg: "bg-gray-100" },
};

export function ContingencyStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

const typeConfig: Record<string, { label: string; icon: string }> = {
  DRIVER_ABSENCE: { label: "Ausencia Conductor", icon: "👤" },
  BUS_BREAKDOWN: { label: "Falla Mecánica", icon: "🚌" },
  ROUTE_DISRUPTION: { label: "Disrupción Ruta", icon: "🚧" },
  DEMAND_SURGE: { label: "Demanda Extra", icon: "📈" },
};

export function ContingencyTypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] || { label: type, icon: "❓" };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
