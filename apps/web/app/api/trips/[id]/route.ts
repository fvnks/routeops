import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateTripSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      route: true,
      assignments: {
        include: {
          driver: true,
          bus: true,
        },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = updateTripSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  const data = validated.data;

  const trip = await prisma.trip.update({
    where: { id: params.id },
    data: {
      ...(data.scheduledDate && { scheduledDate: data.scheduledDate }),
      ...(data.departureTime && { departureTime: data.departureTime }),
      ...(data.status && { status: data.status }),
      ...(data.overrideOrigin !== undefined && { overrideOrigin: data.overrideOrigin || null }),
      ...(data.overrideDestination !== undefined && { overrideDestination: data.overrideDestination || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
    include: { route: true },
  });

  await logAudit({
    entityType: "trip",
    entityId: trip.id,
    action: "UPDATE",
    oldValues: existing,
    newValues: data,
  });

  return NextResponse.json(trip);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  const trip = await prisma.trip.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  await logAudit({
    entityType: "trip",
    entityId: trip.id,
    action: "STATUS_CHANGE",
    oldValues: { status: existing.status },
    newValues: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
