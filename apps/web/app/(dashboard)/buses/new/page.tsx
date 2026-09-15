"use client";

import { PageHeader } from "@/components/shared/page-header";
import { BusForm } from "@/components/buses/bus-form";

export default function NewBusPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Nuevo Bus" />
      <BusForm
        onSubmit={async (data) => {
          const res = await fetch("/api/buses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Error al crear bus");
          }
        }}
      />
    </div>
  );
}
