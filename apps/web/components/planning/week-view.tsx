"use client";

import { formatDate } from "@/lib/utils";
import { TripCard } from "./trip-card";
import { ConflictIndicator } from "./conflict-indicator";
import type { DaySchedule, TripWithDetails } from "@/types";

interface WeekViewProps {
  days: DaySchedule[];
  onTripClick?: (trip: TripWithDetails) => void;
  filter?: "all" | "unassigned" | "conflicts";
}

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function WeekView({ days, onTripClick, filter = "all" }: WeekViewProps) {
  const today = new Date().toISOString().split("T")[0];

  const filteredDays = days.map((day) => {
    let trips = day.trips;
    if (filter === "unassigned") {
      trips = trips.filter((t) => t.assignments.length === 0);
    } else if (filter === "conflicts") {
      trips = trips.filter((t) => {
        const hasConflict = t.status === "CONTINGENCY_AFFECTED" || t.status === "PENDING_REPLACEMENT";
        return hasConflict;
      });
    }
    return { ...day, trips };
  });

  return (
    <div className="grid grid-cols-7 gap-3">
      {filteredDays.map((day) => {
        const d = new Date(day.date + "T12:00:00");
        const isToday = day.date === today;
        const dayName = dayNamesShort[d.getDay()];

        return (
          <div key={day.date} className="min-h-[500px]">
            <div className={`sticky top-0 z-10 pb-2 mb-2 border-b ${isToday ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                    {dayName}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? "text-blue-700" : "text-gray-900"}`}>
                    {d.getDate()}
                  </p>
                </div>
                {day.stats.conflicts > 0 && (
                  <ConflictIndicator conflicts={Array(day.stats.conflicts).fill("")} />
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">{day.stats.total} viajes</span>
                </div>
                {day.stats.unassigned > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    <span className="text-orange-600 font-medium">{day.stats.unassigned} sin asignar</span>
                  </div>
                )}
                {day.stats.assigned > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span className="text-green-600">{day.stats.assigned} asignados</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {day.trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onClick={() => onTripClick?.(trip)} />
              ))}
              {day.trips.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">
                  {filter === "all" ? "Sin viajes" : "Sin resultados"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
