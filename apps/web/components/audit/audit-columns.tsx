"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/utils";

export interface AuditLogRow {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
}

const actionLabels: Record<string, string> = {
  CREATE: "Crear",
  UPDATE: "Actualizar",
  DELETE: "Eliminar",
  ASSIGN: "Asignar",
  UNASSIGN: "Desasignar",
  STATUS_CHANGE: "Cambio de estado",
  IMPORT: "Importar",
};

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  ASSIGN: "bg-purple-100 text-purple-800",
  UNASSIGN: "bg-orange-100 text-orange-800",
  STATUS_CHANGE: "bg-yellow-100 text-yellow-800",
  IMPORT: "bg-indigo-100 text-indigo-800",
};

export const auditColumns: ColumnDef<AuditLogRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Acción",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          actionColors[row.original.action] || "bg-gray-100 text-gray-800"
        }`}
      >
        {actionLabels[row.original.action] || row.original.action}
      </span>
    ),
  },
  {
    accessorKey: "entityType",
    header: "Entidad",
    cell: ({ row }) => {
      const entityLabels: Record<string, string> = {
        driver: "Conductor",
        bus: "Bus",
        route: "Ruta",
        trip: "Viaje",
        assignment: "Asignación",
      };
      return (
        <span className="text-sm font-medium text-gray-900">
          {entityLabels[row.original.entityType] || row.original.entityType}
        </span>
      );
    },
  },
  {
    accessorKey: "entityId",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600 font-mono">
        {row.original.entityId.slice(0, 8)}...
      </span>
    ),
  },
  {
    id: "user",
    header: "Usuario",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.user
          ? `${row.original.user.firstName} ${row.original.user.lastName}`
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.description || "—"}</span>
    ),
  },
];
