import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateRouteSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const route = await prisma.route.findUnique({
    where: { id: params.id },
    include: { _count: { select: { trips: true } } },
  });

  if (!route) {
    return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
  }

  return NextResponse.json(route);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = updateRouteSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.route.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
  }

  const data = validated.data;

  const route = await prisma.route.update({
    where: { id: params.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.code && { code: data.code }),
      ...(data.type && { type: data.type }),
      ...(data.origin && { origin: data.origin }),
      ...(data.destination && { destination: data.destination }),
      ...(data.stops !== undefined && { stops: data.stops }),
      ...(data.estimatedDuration && { estimatedDuration: data.estimatedDuration }),
      ...(data.distanceKm !== undefined && { distanceKm: data.distanceKm }),
      ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
    },
  });

  await logAudit({
    entityType: "route",
    entityId: route.id,
    action: "UPDATE",
    oldValues: existing,
    newValues: data,
  });

  return NextResponse.json(route);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.route.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });
  }

  await prisma.route.update({
    where: { id: params.id },
    data: { active: false },
  });

  await logAudit({
    entityType: "route",
    entityId: params.id,
    action: "STATUS_CHANGE",
    oldValues: { active: existing.active },
    newValues: { active: false },
  });

  return NextResponse.json({ success: true });
}
