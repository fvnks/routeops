"use client";

import { DataTable } from "@/components/shared/data-table";
import { driverColumns, type DriverRow } from "./driver-columns";

interface DriverTableProps {
  data: DriverRow[];
  loading?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export function DriverTable({
  data,
  loading,
  page,
  total,
  limit,
  onPageChange,
}: DriverTableProps) {
  return (
    <DataTable
      data={data}
      columns={driverColumns}
      loading={loading}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      emptyTitle="No hay conductores"
      emptyDescription="Comienza agregando un conductor al sistema"
      emptyAction={{ label: "Crear conductor", href: "/drivers/new" }}
    />
  );
}
