"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { WeekView } from "@/components/planning/week-view";
import { TripCard } from "@/components/planning/trip-card";
import { TripAssignDialog } from "@/components/trips/trip-assign-dialog";
import { formatDate } from "@/lib/utils";
import type { DaySchedule, TripWithDetails } from "@/types";

export default function PlanningPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  });
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => { fetchPlanning(); }, [startDate]);

  async function fetchPlanning() {
    setLoading(true);
    const res = await fetch(`/api/planning?from=${startDate}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  function navigateWeek(dir: number) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dir * 7);
    setStartDate(d.toISOString().split("T")[0]);
  }

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planificación</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => navigateWeek(-1)} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">← Anterior</button>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm" />
          <button onClick={() => { const d = new Date(); d.setHours(0,0,0,0); setStartDate(d.toISOString().split("T")[0]); }}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Hoy</button>
          <button onClick={() => navigateWeek(1)} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Siguiente →</button>
        </div>
      </div>

      {loading ? (
        <LoadingPage />
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">Error al cargar datos</div>
      ) : (
        <div className="grid grid-cols-7 gap-2 min-h-[600px]">
          {data.days.map((day: any) => {
            const d = new Date(day.date + "T12:00:00");
            return (
              <div key={day.date} className="bg-white rounded-lg border border-gray-200 flex flex-col">
                <div className="p-2 border-b border-gray-200 text-center">
                  <p className="text-xs text-gray-500">{dayNames[d.getDay()]}</p>
                  <p className="text-sm font-semibold text-gray-900">{d.getDate()}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">{day.stats.total}</span>
                    {day.stats.unassigned > 0 && (
                      <span className="text-xs text-red-500 font-medium">({day.stats.unassigned} sin asignar)</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-1 space-y-1 overflow-y-auto max-h-[500px]">
                  {day.trips.map((trip: any) => {
                    const hasAssignment = trip.assignments?.length > 0;
                    const time = new Date(trip.departureTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={trip.id} onClick={() => setSelectedTripId(trip.id)}
                        className={`p-1.5 rounded text-xs cursor-pointer border transition-colors ${hasAssignment ? "bg-green-50 border-green-200 hover:bg-green-100" : "bg-orange-50 border-orange-200 hover:bg-orange-100"}`}>
                        <p className="font-medium text-gray-900">{time}</p>
                        <p className="text-gray-600 truncate">{trip.route?.origin}→{trip.route?.destination}</p>
                        {hasAssignment ? (
                          <p className="text-gray-500 truncate">{trip.assignments[0].driver?.firstName} {trip.assignments[0].driver?.lastName?.charAt(0)}.</p>
                        ) : (
                          <p className="text-orange-500 font-medium">Sin asignar</p>
                        )}
                        {hasAssignment && <p className="text-gray-400 truncate">{trip.assignments[0].bus?.plateNumber}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TripAssignDialog tripId={selectedTripId} open={!!selectedTripId} onClose={() => setSelectedTripId(null)} onAssigned={fetchPlanning} />
    </div>
  );
}
