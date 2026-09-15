"use client";

import { PageHeader } from "@/components/shared/page-header";
import { RouteForm } from "@/components/routes/route-form";

export default function NewRoutePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Nueva Ruta" />
      <RouteForm
        onSubmit={async (data) => {
          const res = await fetch("/api/routes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Error al crear ruta");
          }
        }}
      />
    </div>
  );
}
