"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DriverStatusBadge } from "@/components/shared/status-badges";

export interface DriverRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string;
  licenseExpiry: string;
  baseLocation: string;
  canNational: boolean;
  canInternational: boolean;
  status: string;
  _count?: { assignments: number };
}

export const driverColumns: ColumnDef<DriverRow>[] = [
  {
    accessorKey: "firstName",
    header: "Nombre",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-gray-900">
          {row.original.firstName} {row.original.lastName}
        </p>
        {row.original.email && (
          <p className="text-sm text-gray-500">{row.original.email}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "licenseNumber",
    header: "Licencia",
    cell: ({ row }) => (
      <div>
        <span className="text-sm text-gray-600">{row.original.licenseNumber}</span>
        <p className="text-xs text-gray-400">
          Vence: {new Date(row.original.licenseExpiry).toLocaleDateString("es-CL")}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "baseLocation",
    header: "Base",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.baseLocation}</span>
    ),
  },
  {
    accessorKey: "canNational",
    header: "Habilitación",
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.canNational && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            NAC
          </span>
        )}
        {row.original.canInternational && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            INT
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <DriverStatusBadge status={row.original.status} />,
  },
  {
    id: "assignments",
    header: "Asignaciones",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original._count?.assignments || 0}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="text-right">Acciones</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link
          href={`/drivers/${row.original.id}`}
          className="text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          Editar
        </Link>
        {row.original.status === "ACTIVE" && (
          <span className="text-red-600 hover:text-red-900 text-sm font-medium cursor-pointer">
            Desactivar
          </span>
        )}
      </div>
    ),
  },
];
