import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Find international trips affected (through Cristo Redentor)
  const affectedTrips = await prisma.trip.findMany({
    where: {
      scheduledDate: { gte: targetDate, lt: nextDay },
      tripType: "INTERNATIONAL",
      status: { notIn: ["CANCELLED", "COMPLETED"] },
    },
    include: {
      route: true,
      assignments: {
        include: {
          driver: true,
          bus: true,
        },
      },
    },
    orderBy: { departureTime: "asc" },
  });

  // Extract unique drivers and buses
  const drivers = new Map<string, any>();
  const buses = new Map<string, any>();

  for (const trip of affectedTrips) {
    for (const assignment of trip.assignments) {
      drivers.set(assignment.driver.id, {
        ...assignment.driver,
        affectedTrip: {
          id: trip.id,
          tripNumber: trip.tripNumber,
          departureTime: trip.departureTime,
          route: trip.route,
        },
      });
      buses.set(assignment.bus.id, {
        ...assignment.bus,
        affectedTrip: {
          id: trip.id,
          tripNumber: trip.tripNumber,
          departureTime: trip.departureTime,
          route: trip.route,
        },
      });
    }
  }

  // Also find available drivers and buses for reassignment
  const availableDrivers = await prisma.driver.findMany({
    where: {
      status: "ACTIVE",
      canInternational: true,
      assignments: {
        none: {
          trip: {
            scheduledDate: { gte: targetDate, lt: nextDay },
            status: { notIn: ["CANCELLED"] },
          },
        },
      },
    },
    include: {
      restrictions: true,
    },
  });

  const availableBuses = await prisma.bus.findMany({
    where: {
      status: "AVAILABLE",
      busType: "INTERNATIONAL",
      assignments: {
        none: {
          trip: {
            scheduledDate: { gte: targetDate, lt: nextDay },
            status: { notIn: ["CANCELLED"] },
          },
        },
      },
    },
  });

  // Find domestic trips that could use these resources
  const domesticTrips = await prisma.trip.findMany({
    where: {
      scheduledDate: { gte: targetDate, lt: nextDay },
      tripType: "NATIONAL",
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      assignments: { none: {} },
    },
    include: { route: true },
    orderBy: { departureTime: "asc" },
    take: 20,
  });

  return NextResponse.json({
    affected: {
      trips: affectedTrips,
      drivers: Array.from(drivers.values()),
      buses: Array.from(buses.values()),
    },
    available: {
      drivers: availableDrivers,
      buses: availableBuses,
    },
    alternativeTrips: domesticTrips,
  });
}
