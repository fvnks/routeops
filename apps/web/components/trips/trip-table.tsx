"use client";

import { DataTable } from "@/components/shared/data-table";
import { tripColumns } from "./trip-columns";
import type { TripWithDetails } from "@/types";

interface TripTableProps {
  data: TripWithDetails[];
  loading?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export function TripTable({
  data,
  loading,
  page,
  total,
  limit,
  onPageChange,
}: TripTableProps) {
  return (
    <DataTable
      data={data}
      columns={tripColumns}
      loading={loading}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      emptyTitle="No hay viajes"
      emptyDescription="Comienza agregando un viaje al sistema"
      emptyAction={{ label: "Crear viaje", href: "/trips/new" }}
    />
  );
}
