"use client";

import { DataTable } from "@/components/shared/data-table";
import { routeColumns, type RouteRow } from "./route-columns";

interface RouteTableProps {
  data: RouteRow[];
  loading?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onDelete?: (id: string) => void;
}

export function RouteTable({
  data,
  loading,
  page,
  total,
  limit,
  onPageChange,
  onDelete,
}: RouteTableProps) {
  return (
    <DataTable
      data={data}
      columns={routeColumns}
      loading={loading}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      emptyTitle="No hay rutas"
      emptyDescription="Comienza agregando una ruta al sistema"
      emptyAction={{ label: "Crear ruta", href: "/routes/new" }}
      meta={{ onDelete }}
    />
  );
}
