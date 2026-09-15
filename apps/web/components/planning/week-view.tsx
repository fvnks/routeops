"use client";

import { DayColumn } from "./day-column";
import type { DaySchedule, TripWithDetails } from "@/types";

interface WeekViewProps {
  days: DaySchedule[];
  onTripClick?: (trip: TripWithDetails) => void;
  filter?: "all" | "unassigned" | "conflicts";
}

export function WeekView({ days, onTripClick, filter = "all" }: WeekViewProps) {
  const today = new Date().toISOString().split("T")[0];

  const filteredDays = days.map((day) => {
    let trips = day.trips;
    if (filter === "unassigned") {
      trips = trips.filter((t) => t.assignments.length === 0);
    } else if (filter === "conflicts") {
      trips = trips.filter(
        (t) => t.status === "CONTINGENCY_AFFECTED" || t.status === "PENDING_REPLACEMENT"
      );
    }
    return { ...day, trips };
  });

  return (
    <div className="grid grid-cols-7 gap-3">
      {filteredDays.map((day) => (
        <DayColumn
          key={day.date}
          day={day}
          isToday={day.date === today}
          onTripClick={onTripClick}
        />
      ))}
    </div>
  );
}
