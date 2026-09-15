"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { TripStatusBadge, RouteTypeBadge } from "@/components/shared/status-badges";
import { formatTime } from "@/lib/utils";
import type { TripWithDetails } from "@/types";

export const tripColumns: ColumnDef<TripWithDetails>[] = [
  {
    accessorKey: "tripNumber",
    header: "N° Viaje",
    cell: ({ row }) => (
      <span className="text-sm font-mono text-gray-900">{row.original.tripNumber}</span>
    ),
  },
  {
    accessorKey: "departureTime",
    header: "Hora",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{formatTime(row.original.departureTime)}</span>
    ),
  },
  {
    id: "route",
    header: "Ruta",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.route.origin} → {row.original.route.destination}
      </span>
    ),
  },
  {
    accessorKey: "tripType",
    header: "Tipo",
    cell: ({ row }) => <RouteTypeBadge type={row.original.tripType} />,
  },
  {
    id: "driver",
    header: "Conductor",
    cell: ({ row }) => {
      const assignment = row.original.assignments?.[0];
      return assignment?.driver ? (
        <span className="text-sm text-gray-600">
          {assignment.driver.firstName} {assignment.driver.lastName}
        </span>
      ) : (
        <span className="text-sm text-red-500 font-medium">Sin asignar</span>
      );
    },
  },
  {
    id: "bus",
    header: "Bus",
    cell: ({ row }) => {
      const assignment = row.original.assignments?.[0];
      return assignment?.bus ? (
        <span className="text-sm text-gray-600 font-mono">{assignment.bus.plateNumber}</span>
      ) : (
        <span className="text-sm text-red-500 font-medium">Sin asignar</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <TripStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => <span className="text-right">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/trips/${row.original.id}`}
          className="text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          Detalle
        </Link>
      </div>
    ),
  },
];
