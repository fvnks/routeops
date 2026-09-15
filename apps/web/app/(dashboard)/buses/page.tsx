"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { BusTable } from "@/components/buses/bus-table";
import { BusFilters } from "@/components/buses/bus-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { BusRow } from "@/components/buses/bus-columns";

export default function BusesPage() {
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchBuses();
  }, [search, statusFilter]);

  async function fetchBuses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/buses?${params}`);
    const data = await res.json();
    setBuses(data.data || []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/buses/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchBuses();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buses"
        subtitle={`${buses.length} buses registrados`}
        action={{ label: "+ Nuevo Bus", href: "/buses/new" }}
      />

      <BusFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <BusTable data={buses} loading={loading} onDelete={setDeleteId} />

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar bus"
        message="¿Estás seguro de eliminar este bus? Esta acción no se puede deshacer."
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
