"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { DriverTable } from "@/components/drivers/driver-table";
import { DriverFilters } from "@/components/drivers/driver-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { DriverRow } from "@/components/drivers/driver-columns";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter]);

  async function fetchDrivers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/drivers?${params}`);
    const data = await res.json();
    setDrivers(data.data || []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/drivers/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchDrivers();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conductores"
        subtitle={`${drivers.length} conductores registrados`}
        action={{ label: "+ Nuevo Conductor", href: "/drivers/new" }}
      />

      <DriverFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <DriverTable data={drivers} loading={loading} />

      <ConfirmDialog
        open={!!deleteId}
        title="Desactivar conductor"
        message="¿Estás seguro de desactivar este conductor? No podrá ser asignado a viajes."
        variant="danger"
        confirmLabel="Desactivar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
