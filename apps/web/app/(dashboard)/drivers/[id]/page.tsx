"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { DriverForm } from "@/components/drivers/driver-form";
import { RestrictionForm } from "@/components/drivers/restriction-form";
import { VacationCalendar } from "@/components/drivers/vacation-calendar";

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "restrictions" | "vacations">("info");

  useEffect(() => { fetchDriver(); }, [params.id]);

  async function fetchDriver() {
    const res = await fetch(`/api/drivers/${params.id}`);
    if (res.ok) setDriver(await res.json());
    setLoading(false);
  }

  async function handleUpdate(data: any) {
    const res = await fetch(`/api/drivers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar");
    fetchDriver();
  }

  if (loading) return <LoadingPage />;
  if (!driver) return <div className="text-center py-8 text-gray-500">Conductor no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={`${driver.firstName} ${driver.lastName}`} subtitle={`${driver.licenseNumber} · ${driver.baseLocation}`} />

      <div className="flex gap-1 border-b border-gray-200">
        {(["info", "restrictions", "vacations"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "info" ? "Información" : t === "restrictions" ? "Restricciones" : "Vacaciones"}
          </button>
        ))}
      </div>

      {tab === "info" && <DriverForm initial={driver} onSubmit={handleUpdate} />}
      {tab === "restrictions" && <RestrictionForm initial={driver.restrictions} driverId={driver.id} onSave={fetchDriver} />}
      {tab === "vacations" && <div className="bg-white rounded-lg border border-gray-200 p-6"><VacationCalendar driverId={driver.id} /></div>}
    </div>
  );
}
