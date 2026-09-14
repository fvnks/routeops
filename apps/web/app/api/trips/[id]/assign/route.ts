import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignTripSchema } from "@/lib/validations";
import { validateAssignment } from "@/lib/assignments";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = assignTripSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const { driverId, busId } = validated.data;

  const trip = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  if (trip.status === "CANCELLED" || trip.status === "COMPLETED") {
    return NextResponse.json({ error: "No se puede asignar un viaje cancelado o completado" }, { status: 400 });
  }

  const validation = await validateAssignment({ driverId, busId, tripId: params.id });

  if (!validation.valid) {
    return NextResponse.json({
      error: "Asignación no válida",
      validation,
    }, { status: 422 });
  }

  const existingAssignment = await prisma.tripAssignment.findUnique({
    where: { tripId: params.id },
  });

  let assignment;

  if (existingAssignment) {
    assignment = await prisma.tripAssignment.update({
      where: { tripId: params.id },
      data: { driverId, busId },
      include: { driver: true, bus: true },
    });

    await logAudit({
      entityType: "trip",
      entityId: params.id,
      action: "ASSIGN",
      oldValues: { driverId: existingAssignment.driverId, busId: existingAssignment.busId },
      newValues: { driverId, busId },
      description: "Asignación actualizada",
    });
  } else {
    assignment = await prisma.tripAssignment.create({
      data: {
        tripId: params.id,
        driverId,
        busId,
      },
      include: { driver: true, bus: true },
    });

    await logAudit({
      entityType: "trip",
      entityId: params.id,
      action: "ASSIGN",
      newValues: { driverId, busId },
      description: "Nueva asignación",
    });
  }

  if (trip.status === "SCHEDULED") {
    await prisma.trip.update({
      where: { id: params.id },
      data: { status: "CONFIRMED" },
    });
  }

  return NextResponse.json({ assignment, validation });
}
