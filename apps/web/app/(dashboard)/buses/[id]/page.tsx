"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { BusForm } from "@/components/buses/bus-form";
import { MaintenanceForm } from "@/components/buses/maintenance-form";

export default function BusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "maintenance">("info");

  useEffect(() => { fetchBus(); }, [params.id]);

  async function fetchBus() {
    const res = await fetch(`/api/buses/${params.id}`);
    if (res.ok) setBus(await res.json());
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    const res = await fetch(`/api/buses/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar");
    fetchBus();
  }

  if (loading) return <LoadingPage />;
  if (!bus) return <div className="text-center py-8 text-gray-500">Bus no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title={bus.internalCode || bus.plateNumber} subtitle={`${bus.plateNumber} · ${bus.brand} ${bus.model}`} />

      <div className="flex gap-1 border-b border-gray-200">
        {(["info", "maintenance"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "info" ? "Información" : "Mantenimiento"}
          </button>
        ))}
      </div>

      {tab === "info" && <BusForm initial={bus} onSubmit={handleUpdate} />}
      {tab === "maintenance" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <MaintenanceForm busId={bus.id} onSave={fetchBus} />
          {bus.maintenanceRecords?.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium text-gray-700">Historial</h3>
              {bus.maintenanceRecords.map((m: any) => (
                <div key={m.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">{m.type} — {m.description || "Sin descripción"}</p>
                  <p className="text-xs text-gray-500">{m.startDate} {m.endDate ? `→ ${m.endDate}` : "(en curso)"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
