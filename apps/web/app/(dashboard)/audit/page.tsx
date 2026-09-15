"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AuditTable } from "@/components/audit/audit-table";
import { AuditFilters } from "@/components/audit/audit-filters";
import type { AuditLogRow } from "@/components/audit/audit-columns";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams();
    if (entityFilter) params.set("entityType", entityFilter);
    if (actionFilter) params.set("action", actionFilter);
    const res = await fetch(`/api/audit?${params}`);
    const data = await res.json();
    setLogs(data.data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría"
        subtitle="Historial de cambios en el sistema"
      />

      <AuditFilters
        entityFilter={entityFilter}
        onEntityFilterChange={setEntityFilter}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
      />

      <AuditTable data={logs} loading={loading} />
    </div>
  );
}
