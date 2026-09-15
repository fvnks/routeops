"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { RouteForm } from "@/components/routes/route-form";

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRoute(); }, [params.id]);

  async function fetchRoute() {
    const res = await fetch(`/api/routes/${params.id}`);
    if (res.ok) setRoute(await res.json());
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    const res = await fetch(`/api/routes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar");
    fetchRoute();
  }

  if (loading) return <LoadingPage />;
  if (!route) return <div className="text-center py-8 text-gray-500">Ruta no encontrada</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title={route.name} subtitle={route.code} />
      <RouteForm initial={route} onSubmit={handleUpdate} />
    </div>
  );
}
