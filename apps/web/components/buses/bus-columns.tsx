"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { BusStatusBadge } from "@/components/shared/status-badges";

export interface BusRow {
  id: string;
  plateNumber: string;
  internalCode: string | null;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  busType: string;
  status: string;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
}

export const busColumns: ColumnDef<BusRow>[] = [
  {
    accessorKey: "internalCode",
    header: "Código",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-900">
        {row.original.internalCode || "—"}
      </span>
    ),
  },
  {
    accessorKey: "plateNumber",
    header: "Patente",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 font-mono">{row.original.plateNumber}</span>
    ),
  },
  {
    accessorKey: "brand",
    header: "Marca/Modelo",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.brand} {row.original.model}
      </span>
    ),
  },
  {
    accessorKey: "year",
    header: "Año",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.year}</span>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacidad",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.capacity} asientos</span>
    ),
  },
  {
    accessorKey: "busType",
    header: "Tipo",
    cell: ({ row }) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        row.original.busType === "INTERNATIONAL"
          ? "bg-purple-100 text-purple-800"
          : "bg-blue-100 text-blue-800"
      }`}>
        {row.original.busType === "INTERNATIONAL" ? "INT" : "NAC"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <BusStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => <span className="text-right">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/buses/${row.original.id}`}
          className="text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          Editar
        </Link>
      </div>
    ),
  },
];
