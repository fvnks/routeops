import { TRIP_STATUS_COLORS, STATUS_LABELS, DRIVER_STATUS_COLORS, BUS_STATUS_COLORS } from "@/lib/constants";
import type { TripStatus } from "@/types";

export function DriverStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DRIVER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function BusStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BUS_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TRIP_STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function RouteTypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      type === "NATIONAL" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
    }`}>
      {type === "NATIONAL" ? "NAC" : "INT"}
    </span>
  );
}
