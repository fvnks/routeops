import { formatDate, getDateRange } from "@/lib/utils";
import { TripCard } from "./trip-card";
import type { DaySchedule } from "@/types";

interface WeekViewProps {
  days: DaySchedule[];
  onTripClick?: (trip: any) => void;
}

export function WeekView({ days, onTripClick }: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => (
        <div key={day.date} className="min-h-[400px]">
          <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-200 mb-2">
            <p className="text-sm font-semibold text-gray-900">{formatDate(day.date)}</p>
            <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
              <span>{day.stats.total} viajes</span>
              {day.stats.conflicts > 0 && (
                <span className="text-red-600 font-medium">{day.stats.conflicts} conflictos</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {day.trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onClick={() => onTripClick?.(trip)} />
            ))}
            {day.trips.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Sin viajes</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
