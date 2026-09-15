"use client";

import { DataTable } from "@/components/shared/data-table";
import { busColumns, type BusRow } from "./bus-columns";

interface BusTableProps {
  data: BusRow[];
  loading?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export function BusTable({
  data,
  loading,
  page,
  total,
  limit,
  onPageChange,
}: BusTableProps) {
  return (
    <DataTable
      data={data}
      columns={busColumns}
      loading={loading}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      emptyTitle="No hay buses"
      emptyDescription="Comienza agregando un bus al sistema"
      emptyAction={{ label: "Crear bus", href: "/buses/new" }}
    />
  );
}
