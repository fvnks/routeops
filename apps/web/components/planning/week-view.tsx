"use client";

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import { DayColumn } from "./day-column";
import { TripCard } from "./trip-card";
import type { DaySchedule, TripWithDetails } from "@/types";

interface WeekViewProps {
  days: DaySchedule[];
  onTripClick?: (trip: TripWithDetails) => void;
  filter?: "all" | "unassigned" | "conflicts";
  onMoveTrip?: (tripId: string, newDate: string) => void;
}

export function WeekView({ days, onTripClick, filter = "all", onMoveTrip }: WeekViewProps) {
  const [activeTrip, setActiveTrip] = useState<TripWithDetails | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  function handleDragStart(event: DragStartEvent) {
    const trip = event.active.data.current?.trip;
    if (trip) {
      setActiveTrip(trip);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTrip(null);
    const { active, over } = event;

    if (!over) return;

    const tripId = active.id as string;
    const newDate = over.id as string;

    // Don't move if dropped on same day
    const trip = active.data.current?.trip;
    if (trip && trip.scheduledDate.split("T")[0] === newDate) return;

    if (onMoveTrip) {
      onMoveTrip(tripId, newDate);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

      <DragOverlay>
        {activeTrip ? (
          <div className="opacity-80">
            <TripCard trip={activeTrip} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
