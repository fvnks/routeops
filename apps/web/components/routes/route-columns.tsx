"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { RouteTypeBadge } from "@/components/shared/status-badges";

export interface RouteRow {
  id: string;
  code: string;
  name: string;
  type: string;
  origin: string;
  destination: string;
  estimatedDuration: number;
  active: boolean;
  _count?: { trips: number };
}

export const routeColumns: ColumnDef<RouteRow>[] = [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => (
      <span className="text-sm font-mono font-medium text-gray-900">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "origin",
    header: "Origen",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.origin}</span>
    ),
  },
  {
    accessorKey: "destination",
    header: "Destino",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.destination}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => <RouteTypeBadge type={row.original.type} />,
  },
  {
    accessorKey: "estimatedDuration",
    header: "Duración",
    cell: ({ row }) => {
      const d = row.original.estimatedDuration;
      return (
        <span className="text-sm text-gray-600">
          {Math.floor(d / 60)}h {d % 60}min
        </span>
      );
    },
  },
  {
    id: "trips",
    header: "Viajes",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original._count?.trips || 0}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="text-right">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/routes/${row.original.id}`}
          className="text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          Editar
        </Link>
      </div>
    ),
  },
];
