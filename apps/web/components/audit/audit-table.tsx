"use client";

import { DataTable } from "@/components/shared/data-table";
import { auditColumns, type AuditLogRow } from "./audit-columns";

interface AuditTableProps {
  data: AuditLogRow[];
  loading?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export function AuditTable({
  data,
  loading,
  page,
  total,
  limit,
  onPageChange,
}: AuditTableProps) {
  return (
    <DataTable
      data={data}
      columns={auditColumns}
      loading={loading}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      emptyTitle="No hay registros de auditoría"
      emptyDescription="Los cambios en el sistema aparecerán aquí"
    />
  );
}
