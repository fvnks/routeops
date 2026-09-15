"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TripForm } from "@/components/trips/trip-form";

export default function NewTripPage() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/routes").then((r) => r.json()).then(setRoutes);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Nuevo Viaje" />
      <TripForm
        routes={routes}
        onSubmit={async (data) => {
          const [hours, minutes] = data.departureTime.split(":").map(Number);
          const departureDateTime = new Date(data.scheduledDate);
          departureDateTime.setHours(hours, minutes, 0, 0);
          const res = await fetch("/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, departureTime: departureDateTime.toISOString() }),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Error al crear viaje");
          }
        }}
      />
    </div>
  );
}
