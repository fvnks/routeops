import { prisma } from "./prisma";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export async function validateAssignment(params: {
  driverId: string;
  busId: string;
  tripId: string;
}): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  const trip = await prisma.trip.findUnique({
    where: { id: params.tripId },
    include: { route: true },
  });

  if (!trip) {
    return { valid: false, errors: [{ field: "trip", message: "Viaje no encontrado", code: "NOT_FOUND" }], warnings: [] };
  }

  const driver = await prisma.driver.findUnique({
    where: { id: params.driverId },
    include: { restrictions: true, vacations: true, redDays: true },
  });

  if (!driver) {
    return { valid: false, errors: [{ field: "driver", message: "Conductor no encontrado", code: "NOT_FOUND" }], warnings: [] };
  }

  const bus = await prisma.bus.findUnique({ where: { id: params.busId } });

  if (!bus) {
    return { valid: false, errors: [{ field: "bus", message: "Bus no encontrado", code: "NOT_FOUND" }], warnings: [] };
  }

  // 1. Driver active
  if (driver.status !== "ACTIVE") {
    errors.push({ field: "driver", message: "Conductor no está activo", code: "DRIVER_INACTIVE" });
  }

  // 2. Bus available
  if (bus.status !== "AVAILABLE") {
    errors.push({ field: "bus", message: "Bus no está disponible", code: "BUS_UNAVAILABLE" });
  }

  // 3. Qualifications
  if (trip.tripType === "INTERNATIONAL" && !driver.canInternational) {
    errors.push({ field: "driver", message: "Conductor no habilitado para servicio internacional", code: "NOT_QUALIFIED" });
  }

  if (trip.tripType === "NATIONAL" && !driver.canNational) {
    errors.push({ field: "driver", message: "Conductor no habilitado para servicio nacional", code: "NOT_QUALIFIED" });
  }

  // 4. Vacation check
  const tripDate = new Date(trip.scheduledDate);
  const onVacation = driver.vacations.some((v) => {
    const start = new Date(v.startDate);
    const end = new Date(v.endDate);
    return tripDate >= start && tripDate <= end;
  });

  if (onVacation) {
    errors.push({ field: "driver", message: "Conductor tiene vacaciones programadas para esta fecha", code: "ON_VACATION" });
  }

  // 5. Red day check
  const isRedDay = driver.redDays.some((rd) => {
    const rdDate = new Date(rd.date);
    return (
      rdDate.getFullYear() === tripDate.getFullYear() &&
      rdDate.getMonth() === tripDate.getMonth() &&
      rdDate.getDate() === tripDate.getDate()
    );
  });

  if (isRedDay) {
    errors.push({ field: "driver", message: "Conductor tiene día rojo en esta fecha", code: "RED_DAY" });
  }

  // 6. Restricted routes
  if (driver.restrictions?.restrictedRoutes.includes(trip.route.destination)) {
    errors.push({ field: "driver", message: `Conductor restringido para destino: ${trip.route.destination}`, code: "RESTRICTED_ROUTE" });
  }

  // 7. Time conflict - driver
  const departureTime = new Date(trip.departureTime);
  const arrivalTime = trip.arrivalTime ? new Date(trip.arrivalTime) : new Date(departureTime.getTime() + trip.route.estimatedDuration * 60000);

  const conflictingDriverAssignment = await prisma.tripAssignment.findFirst({
    where: {
      driverId: params.driverId,
      trip: {
        scheduledDate: trip.scheduledDate,
        status: { notIn: ["CANCELLED"] },
      },
      tripId: { not: params.tripId },
    },
    include: { trip: { include: { route: true } } },
  });

  if (conflictingDriverAssignment) {
    const existingDeparture = new Date(conflictingDriverAssignment.trip.departureTime);
    const existingArrival = conflictingDriverAssignment.trip.arrivalTime
      ? new Date(conflictingDriverAssignment.trip.arrivalTime)
      : new Date(existingDeparture.getTime() + conflictingDriverAssignment.trip.route.estimatedDuration * 60000);

    if (departureTime < existingArrival && arrivalTime > existingDeparture) {
      errors.push({
        field: "driver",
        message: `Conflicto de horario con viaje ${conflictingDriverAssignment.trip.tripNumber}`,
        code: "TIME_CONFLICT",
      });
    }
  }

  // 8. Time conflict - bus
  const conflictingBusAssignment = await prisma.tripAssignment.findFirst({
    where: {
      busId: params.busId,
      trip: {
        scheduledDate: trip.scheduledDate,
        status: { notIn: ["CANCELLED"] },
      },
      tripId: { not: params.tripId },
    },
    include: { trip: { include: { route: true } } },
  });

  if (conflictingBusAssignment) {
    const existingDeparture = new Date(conflictingBusAssignment.trip.departureTime);
    const existingArrival = conflictingBusAssignment.trip.arrivalTime
      ? new Date(conflictingBusAssignment.trip.arrivalTime)
      : new Date(existingDeparture.getTime() + conflictingBusAssignment.trip.route.estimatedDuration * 60000);

    if (departureTime < existingArrival && arrivalTime > existingDeparture) {
      errors.push({
        field: "bus",
        message: `Bus tiene conflicto de horario con viaje ${conflictingBusAssignment.trip.tripNumber}`,
        code: "BUS_TIME_CONFLICT",
      });
    }
  }

  // 9. Rest period
  if (driver.restrictions) {
    const lastAssignment = await prisma.tripAssignment.findFirst({
      where: {
        driverId: params.driverId,
        trip: {
          scheduledDate: { lt: trip.scheduledDate },
          status: { notIn: ["CANCELLED"] },
        },
      },
      include: { trip: { include: { route: true } } },
      orderBy: { trip: { departureTime: "desc" } },
    });

    if (lastAssignment) {
      const lastArrival = lastAssignment.trip.arrivalTime
        ? new Date(lastAssignment.trip.arrivalTime)
        : new Date(new Date(lastAssignment.trip.departureTime).getTime() + lastAssignment.trip.route.estimatedDuration * 60000);

      const hoursSinceLastArrival = (departureTime.getTime() - lastArrival.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastArrival < driver.restrictions.minRestHours) {
        errors.push({
          field: "driver",
          message: `No cumple descanso mínimo (${driver.restrictions.minRestHours}h). Último viaje termina ${lastArrival.toLocaleTimeString()}`,
          code: "INSUFFICIENT_REST",
        });
      }
    }
  }

  // 10. Warnings
  if (driver.status === "ACTIVE" && !onVacation && !isRedDay) {
    const weeklyAssignments = await prisma.tripAssignment.count({
      where: {
        driverId: params.driverId,
        trip: {
          scheduledDate: {
            gte: new Date(tripDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            lte: tripDate,
          },
          status: { notIn: ["CANCELLED"] },
        },
      },
    });

    if (weeklyAssignments >= driver.maxDaysPerWeek) {
      warnings.push(`Conductor alcanza máximo de días por semana (${driver.maxDaysPerWeek})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
