"use client";

import { TripCard } from "./trip-card";
import { ConflictIndicator } from "./conflict-indicator";
import type { DaySchedule, TripWithDetails } from "@/types";

const dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface DayColumnProps {
  day: DaySchedule;
  isToday?: boolean;
  onTripClick?: (trip: TripWithDetails) => void;
}

export function DayColumn({ day, isToday = false, onTripClick }: DayColumnProps) {
  const d = new Date(day.date + "T12:00:00");
  const dayName = dayNamesShort[d.getDay()];

  return (
    <div className="min-h-[500px]">
      <div
        className={`sticky top-0 z-10 pb-2 mb-2 border-b ${
          isToday ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p
              className={`text-xs font-medium ${
                isToday ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {dayName}
            </p>
            <p
              className={`text-lg font-bold ${
                isToday ? "text-blue-700" : "text-gray-900"
              }`}
            >
              {d.getDate()}
            </p>
          </div>
          {day.stats.conflicts > 0 && (
            <ConflictIndicator conflicts={Array(day.stats.conflicts).fill("")} />
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-gray-500">{day.stats.total} viajes</span>
          {day.stats.unassigned > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              <span className="text-orange-600 font-medium">
                {day.stats.unassigned} sin asignar
              </span>
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
          <p className="text-xs text-gray-400 text-center py-6">Sin viajes</p>
        )}
      </div>
    </div>
  );
}
