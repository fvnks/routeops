import { z } from "zod";

// ─── CONDUCTORES ──────────────────────────────────────

export const createDriverSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  licenseNumber: z.string().min(1, "Número de licencia requerido"),
  licenseExpiry: z.string().transform((s) => new Date(s)),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  baseLocation: z.string(),
  canNational: z.boolean().default(true),
  canInternational: z.boolean().default(false),
  maxHoursPerWeek: z.number().int().min(1).max(60).default(45),
  maxDaysPerWeek: z.number().int().min(1).max(7).default(6),
});

export const updateDriverSchema = createDriverSchema.partial();

// ─── BUSES ────────────────────────────────────────────

export const createBusSchema = z.object({
  plateNumber: z.string().min(1, "Patente requerida"),
  internalCode: z.string().optional(),
  model: z.string().min(1, "Modelo requerido"),
  brand: z.string().optional(),
  year: z.number().int().min(1990).max(2030).optional(),
  capacity: z.number().int().min(1).max(100).default(50),
  hasAC: z.boolean().default(true),
  hasWifi: z.boolean().default(false),
  busType: z.string().default("standard"),
});

export const updateBusSchema = createBusSchema.partial();

// ─── RUTAS ────────────────────────────────────────────

export const createRouteSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  code: z.string().min(1, "Código requerido"),
  type: z.enum(["NATIONAL", "INTERNATIONAL"]),
  origin: z.string().min(1, "Origen requerido"),
  destination: z.string().min(1, "Destino requerido"),
  stops: z.array(z.string()).default([]),
  estimatedDuration: z.number().int().min(1, "Duración requerida (minutos)"),
  distanceKm: z.number().positive().optional(),
  basePrice: z.number().min(0).default(0),
});

export const updateRouteSchema = createRouteSchema.partial();

// ─── VIAJES ───────────────────────────────────────────

export const createTripSchema = z.object({
  routeId: z.string().min(1, "Ruta requerida"),
  scheduledDate: z.string().transform((s) => new Date(s)),
  departureTime: z.string().transform((s) => new Date(s)),
  tripType: z.enum(["NATIONAL", "INTERNATIONAL"]),
  overrideOrigin: z.string().optional(),
  overrideDestination: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTripSchema = z.object({
  scheduledDate: z.string().transform((s) => new Date(s)).optional(),
  departureTime: z.string().transform((s) => new Date(s)).optional(),
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "RESCHEDULED",
    "CONTINGENCY_AFFECTED",
    "PENDING_REPLACEMENT",
  ]).optional(),
  overrideOrigin: z.string().optional(),
  overrideDestination: z.string().optional(),
  notes: z.string().optional(),
});

export const assignTripSchema = z.object({
  driverId: z.string().min(1, "Conductor requerido"),
  busId: z.string().min(1, "Bus requerido"),
});

// ─── VACACIONES ───────────────────────────────────────

export const createVacationSchema = z.object({
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  reason: z.string().optional(),
});

// ─── MANTENCIÓN ───────────────────────────────────────

export const createMaintenanceSchema = z.object({
  type: z.enum(["PREVENTIVE", "CORRECTIVE", "EMERGENCY", "INSPECTION"]),
  description: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)).optional(),
  cost: z.number().min(0).optional(),
  mileage: z.number().int().optional(),
});
