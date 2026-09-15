import { prisma } from "./prisma";
import type { ExtraboardStatus } from "@prisma/client";

// ─── GET AVAILABLE EXTRABOARD DRIVERS ──────────────────

export async function getAvailableExtraboard(date: Date) {
  const dateStr = date.toISOString().split("T")[0];

  const extraboard = await prisma.extraboardDriver.findMany({
    where: {
      date: new Date(dateStr),
      status: "AVAILABLE",
    },
    include: {
      driver: {
        include: {
          restrictions: true,
          vacations: true,
        },
      },
    },
    orderBy: { reportTime: "asc" },
  });

  return extraboard;
}

// ─── ASSIGN EXTRABOARD TO TRIP ─────────────────────────

export async function assignExtraboardToTrip(
  extraboardId: string,
  tripId: string
): Promise<{ success: boolean; error?: string }> {
  const extraboard = await prisma.extraboardDriver.findUnique({
    where: { id: extraboardId },
    include: { driver: true },
  });

  if (!extraboard) return { success: false, error: "Extraboard no encontrado" };
  if (extraboard.status !== "AVAILABLE") {
    return { success: false, error: "El conductor extraboard no está disponible" };
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { route: true },
  });

  if (!trip) return { success: false, error: "Viaje no encontrado" };

  // Check if driver can operate this route type
  if (trip.route.type === "INTERNATIONAL" && !extraboard.driver.canInternational) {
    return { success: false, error: "El conductor no está habilitado para rutas internacionales" };
  }

  // Update extraboard status
  await prisma.extraboardDriver.update({
    where: { id: extraboardId },
    data: {
      status: "ON_DUTY",
      assignedTrips: [...extraboard.assignedTrips, tripId],
    },
  });

  return { success: true };
}

// ─── CREATE EXTRABOARD SCHEDULE ────────────────────────

export async function createExtraboardSchedule(
  driverId: string,
  date: Date,
  reportTime: string,
  shiftType: string = "STRAIGHT"
) {
  const dateStr = date.toISOString().split("T")[0];

  // Check if already scheduled
  const existing = await prisma.extraboardDriver.findUnique({
    where: {
      driverId_date_reportTime: {
        driverId,
        date: new Date(dateStr),
        reportTime,
      },
    },
  });

  if (existing) {
    return { success: false, error: "El conductor ya está programado para este turno" };
  }

  const extraboard = await prisma.extraboardDriver.create({
    data: {
      driverId,
      date: new Date(dateStr),
      reportTime,
      shiftType,
      status: "AVAILABLE",
    },
    include: { driver: true },
  });

  return { success: true, extraboard };
}

// ─── GET EXTRABOARD STATS ──────────────────────────────

export async function getExtraboardStats(from: Date, to: Date) {
  const extraboards = await prisma.extraboardDriver.findMany({
    where: {
      date: { gte: from, lte: to },
    },
    include: { driver: true },
  });

  const total = extraboards.length;
  const available = extraboards.filter((e) => e.status === "AVAILABLE").length;
  const onDuty = extraboards.filter((e) => e.status === "ON_DUTY").length;
  const exhausted = extraboards.filter((e) => e.status === "EXHAUSTED").length;

  const utilizationRate = total > 0 ? (onDuty / total) * 100 : 0;

  // Average assignments per extraboard
  const totalAssignments = extraboards.reduce(
    (sum, e) => sum + e.assignedTrips.length,
    0
  );
  const avgAssignments = total > 0 ? totalAssignments / total : 0;

  return {
    total,
    available,
    onDuty,
    exhausted,
    utilizationRate: Math.round(utilizationRate),
    avgAssignments: Math.round(avgAssignments * 10) / 10,
  };
}

// ─── GET EXTRABOARD CALENDAR ───────────────────────────

export async function getExtraboardCalendar(
  startDate: Date,
  endDate: Date
) {
  const extraboards = await prisma.extraboardDriver.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    include: {
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          baseLocation: true,
        },
      },
    },
    orderBy: [{ date: "asc" }, { reportTime: "asc" }],
  });

  // Group by date
  const calendar: Record<string, typeof extraboards> = {};
  for (const e of extraboards) {
    const dateKey = e.date.toISOString().split("T")[0];
    if (!calendar[dateKey]) calendar[dateKey] = [];
    calendar[dateKey].push(e);
  }

  return calendar;
}
