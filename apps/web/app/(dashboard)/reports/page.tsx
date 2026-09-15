"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import {
  generateTripsReport,
  generateDriversReport,
  generateBusesReport,
  generateWeeklyScheduleReport,
  downloadPdf,
} from "@/lib/pdf-reports";

type ReportType = "trips" | "drivers" | "buses" | "weekly";

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportType>("trips");
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  async function handleGenerate() {
    setLoading(true);
    try {
      if (selected === "trips") {
        const res = await fetch(
          `/api/trips?from=${dateFrom}&to=${dateTo}&limit=1000`
        );
        const data = await res.json();
        const trips = (data.data || []).map((t: any) => ({
          tripNumber: t.tripNumber,
          route: t.route?.code || "—",
          date: new Date(t.scheduledDate).toLocaleDateString("es-CL"),
          departure: t.departureTime
            ? new Date(t.departureTime).toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
          driver: t.assignments?.[0]?.driver
            ? `${t.assignments[0].driver.firstName} ${t.assignments[0].driver.lastName}`
            : "Sin asignar",
          bus: t.assignments?.[0]?.bus?.plateNumber || "Sin asignar",
          status: t.status,
        }));
        const doc = generateTripsReport(trips, `${dateFrom} al ${dateTo}`);
        downloadPdf(doc, `viajes_${dateFrom}_${dateTo}.pdf`);
      } else if (selected === "drivers") {
        const res = await fetch("/api/drivers?limit=1000");
        const data = await res.json();
        const drivers = (data.data || []).map((d: any) => ({
          firstName: d.firstName,
          lastName: d.lastName,
          licenseNumber: d.licenseNumber,
          phone: d.phone,
          status: d.status,
        }));
        const doc = generateDriversReport(drivers);
        downloadPdf(doc, `conductores_${new Date().toISOString().split("T")[0]}.pdf`);
      } else if (selected === "buses") {
        const res = await fetch("/api/buses?limit=1000");
        const data = await res.json();
        const buses = (data.data || []).map((b: any) => ({
          plateNumber: b.plateNumber,
          brand: b.brand,
          model: b.model,
          year: b.year,
          status: b.status,
        }));
        const doc = generateBusesReport(buses);
        downloadPdf(doc, `buses_${new Date().toISOString().split("T")[0]}.pdf`);
      } else if (selected === "weekly") {
        const res = await fetch(
          `/api/trips?from=${dateFrom}&to=${dateTo}&limit=1000`
        );
        const data = await res.json();
        const trips = (data.data || []).map((t: any) => ({
          tripNumber: t.tripNumber,
          route: t.route?.code || "—",
          date: new Date(t.scheduledDate).toLocaleDateString("es-CL"),
          departure: t.departureTime
            ? new Date(t.departureTime).toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
          driver: t.assignments?.[0]?.driver
            ? `${t.assignments[0].driver.firstName} ${t.assignments[0].driver.lastName}`
            : "Sin asignar",
          bus: t.assignments?.[0]?.bus?.plateNumber || "Sin asignar",
          status: t.status,
        }));
        const doc = generateWeeklyScheduleReport(trips, dateFrom, dateTo);
        downloadPdf(doc, `plan_semanal_${dateFrom}_${dateTo}.pdf`);
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
    }
    setLoading(false);
  }

  const reports = [
    {
      id: "trips" as ReportType,
      title: "Reporte de Viajes",
      description: "Listado completo de viajes en un período",
      icon: "🚌",
    },
    {
      id: "drivers" as ReportType,
      title: "Listado de Conductores",
      description: "Todos los conductores registrados",
      icon: "👥",
    },
    {
      id: "buses" as ReportType,
      title: "Inventario de Buses",
      description: "Todos los buses de la flota",
      icon: "🚗",
    },
    {
      id: "weekly" as ReportType,
      title: "Plan Semanal",
      description: "Vista horizonte de la semana",
      icon: "📅",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Reportes"
        subtitle="Genera reportes en PDF de la operación"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selected === r.id
                ? "border-slate-900 bg-slate-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-500">{r.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {(selected === "trips" || selected === "weekly") && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Período del reporte
          </h3>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingPage /> Generando...
          </span>
        ) : (
          "Generar Reporte PDF"
        )}
      </button>
    </div>
  );
}
