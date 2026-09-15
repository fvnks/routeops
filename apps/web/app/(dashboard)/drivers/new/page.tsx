"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DriverForm } from "@/components/drivers/driver-form";

export default function NewDriverPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Nuevo Conductor" />
      <DriverForm
        onSubmit={async (data) => {
          const res = await fetch("/api/drivers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Error al crear conductor");
          }
        }}
      />
    </div>
  );
}
