import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json({ error: "Falta tripId" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { route: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    const departureTime = new Date(trip.departureTime);
    const arrivalTime = trip.arrivalTime
      ? new Date(trip.arrivalTime)
      : new Date(departureTime.getTime() + trip.route.estimatedDuration * 60000);
    const tripDate = new Date(trip.scheduledDate);

    // Find all drivers with conflicts
    const conflictingDriverAssignments = await prisma.tripAssignment.findMany({
      where: {
        trip: {
          scheduledDate: tripDate,
          status: { notIn: ["CANCELLED"] },
        },
        tripId: { not: tripId },
      },
      include: { trip: { include: { route: true } } },
    });

    const conflictingDriverIds = new Set<string>();
    for (const assignment of conflictingDriverAssignments) {
      const existingDeparture = new Date(assignment.trip.departureTime);
      const existingArrival = assignment.trip.arrivalTime
        ? new Date(assignment.trip.arrivalTime)
        : new Date(existingDeparture.getTime() + assignment.trip.route.estimatedDuration * 60000);

      if (departureTime < existingArrival && arrivalTime > existingDeparture) {
        conflictingDriverIds.add(assignment.driverId);
      }
    }

    // Find all buses with conflicts
    const conflictingBusAssignments = await prisma.tripAssignment.findMany({
      where: {
        trip: {
          scheduledDate: tripDate,
          status: { notIn: ["CANCELLED"] },
        },
        tripId: { not: tripId },
      },
      include: { trip: { include: { route: true } } },
    });

    const conflictingBusIds = new Set<string>();
    for (const assignment of conflictingBusAssignments) {
      const existingDeparture = new Date(assignment.trip.departureTime);
      const existingArrival = assignment.trip.arrivalTime
        ? new Date(assignment.trip.arrivalTime)
        : new Date(existingDeparture.getTime() + assignment.trip.route.estimatedDuration * 60000);

      if (departureTime < existingArrival && arrivalTime > existingDeparture) {
        conflictingBusIds.add(assignment.busId);
      }
    }

    // Get available drivers (active, no conflict)
    const availableDrivers = await prisma.driver.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: Array.from(conflictingDriverIds) },
        ...(trip.tripType === "INTERNATIONAL" && { canInternational: true }),
        ...(trip.tripType === "NATIONAL" && { canNational: true }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        baseLocation: true,
        canInternational: true,
      },
      orderBy: { firstName: "asc" },
    });

    // Get available buses (available, no conflict)
    const availableBuses = await prisma.bus.findMany({
      where: {
        status: "AVAILABLE",
        id: { notIn: Array.from(conflictingBusIds) },
      },
      select: {
        id: true,
        plateNumber: true,
        internalCode: true,
        busType: true,
        capacity: true,
      },
      orderBy: { plateNumber: "asc" },
    });

    return NextResponse.json({
      drivers: availableDrivers,
      buses: availableBuses,
      trip: {
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error al obtener recursos disponibles:", error);
    return NextResponse.json(
      { error: "Error al obtener recursos disponibles" },
      { status: 500 }
    );
  }
}
