"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { RouteTable } from "@/components/routes/route-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { RouteRow } from "@/components/routes/route-columns";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  async function fetchRoutes() {
    setLoading(true);
    const res = await fetch("/api/routes");
    const data = await res.json();
    setRoutes(data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/routes/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchRoutes();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rutas"
        subtitle={`${routes.length} rutas configuradas`}
        action={{ label: "+ Nueva Ruta", href: "/routes/new" }}
      />

      <RouteTable data={routes} loading={loading} onDelete={setDeleteId} />

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar ruta"
        message="¿Estás seguro de eliminar esta ruta? Esta acción no se puede deshacer."
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
