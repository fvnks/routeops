import { prisma } from "./prisma";

// ─── TYPES ─────────────────────────────────────────────

export interface ReplacementCandidate {
  driverId: string;
  driverName: string;
  busId: string | null;
  busPlate: string | null;
  score: number;
  reasons: string[];
}

export interface ContingencyResult {
  contingencyId: string;
  replacements: ReplacementCandidate[];
  autoResolvable: boolean;
  recommendation: string;
}

// ─── SEVERITY CALCULATION ──────────────────────────────

export function calculateSeverity(
  tripDeparture: Date,
  hasPassengers: boolean,
  isInternational: boolean
): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (hasPassengers) return "CRITICAL";

  const now = new Date();
  const hoursUntilDeparture =
    (tripDeparture.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeparture < 1) return "HIGH";
  if (hoursUntilDeparture < 4) return "MEDIUM";
  return "LOW";
}

// ─── FIND REPLACEMENT DRIVERS ──────────────────────────

export async function findReplacementDrivers(
  tripId: string,
  excludeDriverId?: string
): Promise<ReplacementCandidate[]> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      route: true,
      assignments: { include: { driver: true, bus: true } },
    },
  });

  if (!trip) return [];

  const route = trip.route;
  const tripDate = new Date(trip.scheduledDate);
  const departureTime = new Date(trip.departureTime);

  // Get all active drivers
  const drivers = await prisma.driver.findMany({
    where: {
      status: "ACTIVE",
      ...(excludeDriverId ? { id: { not: excludeDriverId } } : {}),
    },
    include: {
      restrictions: true,
      vacations: true,
      redDays: true,
      assignments: {
        where: {
          trip: {
            scheduledDate: tripDate,
            status: { notIn: ["CANCELLED"] },
          },
        },
        include: { trip: true },
      },
    },
  });

  const candidates: ReplacementCandidate[] = [];

  for (const driver of drivers) {
    // Check if driver can operate this route type
    if (route.type === "INTERNATIONAL" && !driver.canInternational) continue;
    if (route.type === "NATIONAL" && !driver.canNational) continue;

    // Check if driver is on vacation
    const onVacation = driver.vacations.some(
      (v) => tripDate >= v.startDate && tripDate <= v.endDate
    );
    if (onVacation) continue;

    // Check if driver has a red day
    const hasRedDay = driver.redDays.some(
      (rd) => rd.date.toISOString().split("T")[0] === tripDate.toISOString().split("T")[0]
    );
    if (hasRedDay) continue;

    // Check time conflicts with existing assignments
    const hasConflict = driver.assignments.some((a) => {
      const existingDeparture = new Date(a.trip.departureTime);
      const existingArrival = new Date(
        a.trip.arrivalTime || existingDeparture.getTime() + 2 * 60 * 60 * 1000
      );
      const newDeparture = departureTime;
      const newArrival = new Date(
        departureTime.getTime() + route.estimatedDuration * 60 * 1000
      );

      return newDeparture < existingArrival && newArrival > existingDeparture;
    });
    if (hasConflict) continue;

    // Check restricted routes
    if (driver.restrictions?.restrictedRoutes?.includes(route.code)) continue;

    // Calculate score
    let score = 50;
    const reasons: string[] = [];

    // Bonus for base location match
    if (driver.baseLocation === route.origin) {
      score += 20;
      reasons.push("Misma base que origen");
    }

    // Bonus for fewer hours worked this week
    const weeklyHours = driver.assignments.reduce((sum, a) => {
      const duration =
        (new Date(a.trip.arrivalTime || a.trip.departureTime).getTime() -
          new Date(a.trip.departureTime).getTime()) /
        (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    if (weeklyHours < 30) {
      score += 15;
      reasons.push("Pocas horas esta semana");
    } else if (weeklyHours < 40) {
      score += 5;
      reasons.push("Horas moderadas esta semana");
    }

    // Bonus for international capability if needed
    if (route.type === "INTERNATIONAL" && driver.canInternational) {
      score += 10;
      reasons.push("Habilitado internacional");
    }

    // Penalty for many assignments today
    if (driver.assignments.length >= 2) {
      score -= 10;
      reasons.push("Ya tiene varios viajes hoy");
    }

    candidates.push({
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      busId: null,
      busPlate: null,
      score,
      reasons,
    });
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, 10); // Return top 10
}

// ─── FIND REPLACEMENT BUSES ────────────────────────────

export async function findReplacementBuses(
  tripId: string,
  excludeBusId?: string
): Promise<{ busId: string; plateNumber: string; score: number }[]> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { route: true },
  });

  if (!trip) return [];

  const tripDate = new Date(trip.scheduledDate);
  const departureTime = new Date(trip.departureTime);

  const buses = await prisma.bus.findMany({
    where: {
      status: "AVAILABLE",
      ...(excludeBusId ? { id: { not: excludeBusId } } : {}),
    },
    include: {
      assignments: {
        where: {
          trip: {
            scheduledDate: tripDate,
            status: { notIn: ["CANCELLED"] },
          },
        },
        include: { trip: true },
      },
    },
  });

  const available: { busId: string; plateNumber: string; score: number }[] = [];

  for (const bus of buses) {
    // Check time conflicts
    const hasConflict = bus.assignments.some((a) => {
      const existingDeparture = new Date(a.trip.departureTime);
      const existingArrival = new Date(
        a.trip.arrivalTime || existingDeparture.getTime() + 2 * 60 * 60 * 1000
      );
      const newArrival = new Date(
        departureTime.getTime() + trip.route.estimatedDuration * 60 * 1000
      );

      return departureTime < existingArrival && newArrival > existingDeparture;
    });

    if (hasConflict) continue;

    let score = 50;
    if (bus.busType === trip.route.type) score += 20;
    if (bus.capacity >= 40) score += 10;

    available.push({
      busId: bus.id,
      plateNumber: bus.plateNumber,
      score,
    });
  }

  available.sort((a, b) => b.score - a.score);
  return available.slice(0, 10);
}

// ─── CREATE CONTINGENCY ────────────────────────────────

export async function createContingency(params: {
  type: "DRIVER_ABSENCE" | "BUS_BREAKDOWN" | "ROUTE_DISRUPTION" | "DEMAND_SURGE";
  tripId?: string;
  driverId?: string;
  busId?: string;
  reason: string;
  reportedBy?: string;
}): Promise<ContingencyResult> {
  const { type, tripId, driverId, busId, reason, reportedBy } = params;

  let severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  let trip = null;

  if (tripId) {
    trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { route: true, assignments: true },
    });

    if (trip) {
      const isInternational = trip.tripType === "INTERNATIONAL";
      const hasPassengers = trip.status === "IN_PROGRESS";
      severity = calculateSeverity(
        new Date(trip.departureTime),
        hasPassengers,
        isInternational
      );
    }
  }

  // Create the contingency
  const contingency = await prisma.contingency.create({
    data: {
      type,
      severity,
      status: "ACTIVE",
      affectedTripId: tripId || null,
      affectedDriverId: driverId || null,
      affectedBusId: busId || null,
      reason,
      reportedBy,
    },
  });

  // Find replacements
  const replacements = tripId
    ? await findReplacementDrivers(tripId, driverId)
    : [];

  // Determine if auto-resolvable
  const autoResolvable = replacements.length > 0;
  const recommendation = autoResolvable
    ? `Se encontraron ${replacements.length} conductores candidatos para reemplazo`
    : "No hay conductores disponibles. Considere cancelar o reprogramar el viaje";

  // Create initial action log
  await prisma.contingencyAction.create({
    data: {
      contingencyId: contingency.id,
      action: "REPORTED",
      performedBy: reportedBy || "system",
      details: { type, severity, reason },
      notes: `Contingencia reportada: ${reason}`,
    },
  });

  return {
    contingencyId: contingency.id,
    replacements,
    autoResolvable,
    recommendation,
  };
}

// ─── RESOLVE CONTINGENCY ───────────────────────────────

export async function resolveContingency(
  contingencyId: string,
  params: {
    resolution: "REASSIGNED" | "CANCELLED" | "DELAYED" | "COVERED_EXTRABOARD" | "COVERED_OVERTIME";
    replacementDriverId?: string;
    replacementBusId?: string;
    notes?: string;
    performedBy?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const contingency = await prisma.contingency.findUnique({
    where: { id: contingencyId },
    include: { affectedTrip: true },
  });

  if (!contingency) return { success: false, error: "Contingencia no encontrada" };
  if (contingency.status !== "ACTIVE" && contingency.status !== "IN_PROGRESS") {
    return { success: false, error: "La contingencia ya fue resuelta" };
  }

  // Update contingency
  await prisma.contingency.update({
    where: { id: contingencyId },
    data: {
      status: "RESOLVED",
      resolution: params.resolution,
      resolvedAt: new Date(),
      resolutionNotes: params.notes,
      replacementDriverId: params.replacementDriverId || null,
      replacementBusId: params.replacementBusId || null,
    },
  });

  // If reassigned, update the trip
  if (params.resolution === "REASSIGNED" && contingency.affectedTripId) {
    // Remove old assignment if exists
    await prisma.tripAssignment.deleteMany({
      where: { tripId: contingency.affectedTripId },
    });

    // Create new assignment if we have both driver and bus
    if (params.replacementDriverId && params.replacementBusId) {
      await prisma.tripAssignment.create({
        data: {
          tripId: contingency.affectedTripId,
          driverId: params.replacementDriverId,
          busId: params.replacementBusId,
          assignedBy: params.performedBy || "system",
        },
      });

      // Update trip status
      await prisma.trip.update({
        where: { id: contingency.affectedTripId },
        data: { status: "CONFIRMED" },
      });
    }
  }

  // If cancelled, update trip status
  if (params.resolution === "CANCELLED" && contingency.affectedTripId) {
    await prisma.trip.update({
      where: { id: contingency.affectedTripId },
      data: { status: "CANCELLED" },
    });
  }

  // Log the resolution
  await prisma.contingencyAction.create({
    data: {
      contingencyId,
      action: "RESOLVED",
      performedBy: params.performedBy || "system",
      details: {
        resolution: params.resolution,
        replacementDriverId: params.replacementDriverId,
        replacementBusId: params.replacementBusId,
      },
      notes: params.notes || `Resuelto con resolución: ${params.resolution}`,
    },
  });

  return { success: true };
}

// ─── GET CONTINGENCY STATS ─────────────────────────────

export async function getContingencyStats(from: Date, to: Date) {
  const contingencies = await prisma.contingency.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    include: {
      affectedTrip: { include: { route: true } },
      actions: true,
    },
  });

  const total = contingencies.length;
  const resolved = contingencies.filter((c) => c.status === "RESOLVED");
  const unresolved = contingencies.filter((c) => c.status !== "RESOLVED");

  // Average resolution time
  const resolutionTimes = resolved
    .filter((c) => c.resolvedAt)
    .map((c) => {
      const reported = new Date(c.reportedAt).getTime();
      const resolvedAt = new Date(c.resolvedAt!).getTime();
      return (resolvedAt - reported) / (1000 * 60); // minutes
    });

  const avgResolutionTime =
    resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

  // By type
  const byType = {
    DRIVER_ABSENCE: contingencies.filter((c) => c.type === "DRIVER_ABSENCE").length,
    BUS_BREAKDOWN: contingencies.filter((c) => c.type === "BUS_BREAKDOWN").length,
    ROUTE_DISRUPTION: contingencies.filter((c) => c.type === "ROUTE_DISRUPTION").length,
    DEMAND_SURGE: contingencies.filter((c) => c.type === "DEMAND_SURGE").length,
  };

  // By severity
  const bySeverity = {
    CRITICAL: contingencies.filter((c) => c.severity === "CRITICAL").length,
    HIGH: contingencies.filter((c) => c.severity === "HIGH").length,
    MEDIUM: contingencies.filter((c) => c.severity === "MEDIUM").length,
    LOW: contingencies.filter((c) => c.severity === "LOW").length,
  };

  // By resolution
  const byResolution = {
    REASSIGNED: resolved.filter((c) => c.resolution === "REASSIGNED").length,
    CANCELLED: resolved.filter((c) => c.resolution === "CANCELLED").length,
    DELAYED: resolved.filter((c) => c.resolution === "DELAYED").length,
    COVERED_EXTRABOARD: resolved.filter((c) => c.resolution === "COVERED_EXTRABOARD").length,
    COVERED_OVERTIME: resolved.filter((c) => c.resolution === "COVERED_OVERTIME").length,
  };

  // Recovery rate
  const recoveryRate = total > 0 ? (resolved.length / total) * 100 : 0;

  return {
    total,
    resolved: resolved.length,
    unresolved: unresolved.length,
    avgResolutionTime: Math.round(avgResolutionTime),
    recoveryRate: Math.round(recoveryRate),
    byType,
    bySeverity,
    byResolution,
  };
}
