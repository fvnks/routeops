import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");

  const startDate = from ? new Date(from) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const trips = await prisma.trip.findMany({
    where: {
      scheduledDate: { gte: startDate, lt: endDate },
    },
    include: {
      route: true,
      assignments: {
        include: {
          driver: { select: { id: true, firstName: true, lastName: true, baseLocation: true, canInternational: true } },
          bus: { select: { id: true, plateNumber: true, internalCode: true, busType: true } },
        },
      },
    },
    orderBy: { departureTime: "asc" },
  });

  const days: Record<string, any> = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    days[dateStr] = {
      date: dateStr,
      trips: [],
      stats: { total: 0, assigned: 0, unassigned: 0, conflicts: 0 },
    };
  }

  for (const trip of trips) {
    const dateStr = new Date(trip.scheduledDate).toISOString().split("T")[0];
    if (days[dateStr]) {
      days[dateStr].trips.push(trip);
      days[dateStr].stats.total++;
      if (trip.assignments.length > 0) {
        days[dateStr].stats.assigned++;
      } else {
        days[dateStr].stats.unassigned++;
      }
    }
  }

  const drivers = await prisma.driver.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      baseLocation: true,
      canNational: true,
      canInternational: true,
    },
  });

  const buses = await prisma.bus.findMany({
    where: { status: "AVAILABLE" },
    select: {
      id: true,
      plateNumber: true,
      internalCode: true,
      busType: true,
      capacity: true,
    },
  });

  return NextResponse.json({
    days: Object.values(days),
    drivers,
    buses,
    dateRange: {
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    },
  });
}
