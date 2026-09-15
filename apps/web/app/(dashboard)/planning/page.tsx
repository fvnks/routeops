"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { WeekView } from "@/components/planning/week-view";
import { PlanningToolbar } from "@/components/planning/planning-toolbar";
import { AssignmentPanel } from "@/components/planning/assignment-panel";
import type { DaySchedule, TripWithDetails } from "@/types";

export default function PlanningPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  });
  const [selectedTrip, setSelectedTrip] = useState<TripWithDetails | null>(null);
  const [filter, setFilter] = useState<"all" | "unassigned" | "conflicts">("all");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/planning?from=${startDate}`);
      const d = await res.json();
      setData(d);
    } catch (error) {
      console.error("Error al cargar planificación:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate]);

  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]);

  function navigateWeek(dir: number) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dir * 7);
    setStartDate(d.toISOString().split("T")[0]);
  }

  function handleToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setStartDate(d.toISOString().split("T")[0]);
  }

  function handleTripClick(trip: TripWithDetails) {
    setSelectedTrip(trip);
  }

  async function handleAssign(driverId: string, busId: string) {
    if (!selectedTrip) return;
    setIsAssigning(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          driverId,
          busId,
        }),
      });
      if (res.ok) {
        setSelectedTrip(null);
        fetchPlanning();
      }
    } catch (error) {
      console.error("Error al asignar:", error);
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleRemoveAssignment(assignmentId: string) {
    try {
      const res = await fetch(`/api/trips?id=${assignmentId}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedTrip(null);
        fetchPlanning();
      }
    } catch (error) {
      console.error("Error al remover asignación:", error);
    }
  }

  async function handleMoveTrip(tripId: string, newDate: string) {
    try {
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, newDate }),
      });
      if (res.ok) {
        fetchPlanning();
      }
    } catch (error) {
      console.error("Error al mover viaje:", error);
    }
  }

  const stats = data
    ? {
        totalTrips: data.days.reduce((sum: number, d: any) => sum + d.stats.total, 0),
        assigned: data.days.reduce((sum: number, d: any) => sum + d.stats.assigned, 0),
        unassigned: data.days.reduce((sum: number, d: any) => sum + d.stats.unassigned, 0),
        conflicts: data.days.reduce((sum: number, d: any) => sum + d.stats.conflicts, 0),
      }
    : undefined;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planificación Semanal"
        subtitle="Organiza y asigna viajes para los próximos 7 días"
      />

      <PlanningToolbar
        startDate={startDate}
        onDateChange={setStartDate}
        onNavigate={navigateWeek}
        onToday={handleToday}
        filter={filter}
        onFilterChange={setFilter}
        stats={stats}
      />

      {loading ? (
        <LoadingPage />
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">Error al cargar datos</div>
      ) : (
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <WeekView days={data.days} onTripClick={handleTripClick} filter={filter} onMoveTrip={handleMoveTrip} />
          </div>

          {selectedTrip && (
            <div className="w-80 flex-shrink-0">
              <AssignmentPanel
                trip={selectedTrip}
                onAssign={handleAssign}
                onRemoveAssignment={handleRemoveAssignment}
                onCancel={() => setSelectedTrip(null)}
                isAssigning={isAssigning}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
