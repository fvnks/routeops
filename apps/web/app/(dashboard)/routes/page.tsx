"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { RouteTable } from "@/components/routes/route-table";
import type { RouteRow } from "@/components/routes/route-columns";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rutas"
        subtitle={`${routes.length} rutas configuradas`}
        action={{ label: "+ Nueva Ruta", href: "/routes/new" }}
      />

      <RouteTable data={routes} loading={loading} />
    </div>
  );
}
