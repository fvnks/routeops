import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTripSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const routeId = searchParams.get("routeId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = {};

  if (date) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    where.scheduledDate = { gte: d, lt: nextDay };
  } else if (from || to) {
    where.scheduledDate = {};
    if (from) where.scheduledDate.gte = new Date(from);
    if (to) where.scheduledDate.lte = new Date(to);
  }

  if (status) where.status = status;
  if (routeId) where.routeId = routeId;

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      include: {
        route: true,
        assignments: {
          include: {
            driver: { select: { id: true, firstName: true, lastName: true, baseLocation: true } },
            bus: { select: { id: true, plateNumber: true, internalCode: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { departureTime: "asc" },
    }),
    prisma.trip.count({ where }),
  ]);

  return NextResponse.json({ data: trips, total, page, limit });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createTripSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = validated.data;

  const route = await prisma.route.findUnique({ where: { id: data.routeId } });
  if (!route) {
    return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
  }

  const existingTrips = await prisma.trip.count({
    where: {
      scheduledDate: data.scheduledDate,
    },
  });

  const dateStr = data.scheduledDate.toISOString().split("T")[0];
  const tripNumber = `TRIP-${dateStr}-${String(existingTrips + 1).padStart(3, "0")}`;

  const arrivalTime = new Date(data.departureTime.getTime() + route.estimatedDuration * 60000);

  const trip = await prisma.trip.create({
    data: {
      routeId: data.routeId,
      tripNumber,
      scheduledDate: data.scheduledDate,
      departureTime: data.departureTime,
      arrivalTime,
      tripType: data.tripType,
      overrideOrigin: data.overrideOrigin || null,
      overrideDestination: data.overrideDestination || null,
      notes: data.notes || null,
    },
    include: { route: true },
  });

  await logAudit({
    entityType: "trip",
    entityId: trip.id,
    action: "CREATE",
    newValues: { ...data, tripNumber },
  });

  return NextResponse.json(trip, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { tripId, newDate } = body;

  if (!tripId || !newDate) {
    return NextResponse.json({ error: "Faltan tripId o newDate" }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { route: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  // Parse new date and preserve departure time
  const oldDeparture = new Date(trip.departureTime);
  const newDateObj = new Date(newDate + "T12:00:00");
  
  // Keep same time, change date
  const newDeparture = new Date(newDateObj);
  newDeparture.setHours(oldDeparture.getHours(), oldDeparture.getMinutes(), 0, 0);

  const newArrival = new Date(newDeparture.getTime() + trip.route.estimatedDuration * 60000);

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: {
      scheduledDate: newDateObj,
      departureTime: newDeparture,
      arrivalTime: newArrival,
    },
    include: { route: true },
  });

  await logAudit({
    entityType: "trip",
    entityId: tripId,
    action: "UPDATE",
    oldValues: { scheduledDate: trip.scheduledDate, departureTime: trip.departureTime },
    newValues: { scheduledDate: newDateObj, departureTime: newDeparture },
  });

  return NextResponse.json(updated);
}
