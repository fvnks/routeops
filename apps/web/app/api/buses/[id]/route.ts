import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBusSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const bus = await prisma.bus.findUnique({
    where: { id: params.id },
    include: {
      maintenance: { orderBy: { startDate: "desc" }, take: 5 },
      _count: { select: { assignments: true } },
    },
  });

  if (!bus) {
    return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
  }

  return NextResponse.json(bus);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = updateBusSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.bus.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
  }

  const data = validated.data;

  const bus = await prisma.bus.update({
    where: { id: params.id },
    data: {
      ...(data.plateNumber && { plateNumber: data.plateNumber }),
      ...(data.internalCode !== undefined && { internalCode: data.internalCode || null }),
      ...(data.model && { model: data.model }),
      ...(data.brand !== undefined && { brand: data.brand || null }),
      ...(data.year !== undefined && { year: data.year || null }),
      ...(data.capacity && { capacity: data.capacity }),
      ...(data.hasAC !== undefined && { hasAC: data.hasAC }),
      ...(data.hasWifi !== undefined && { hasWifi: data.hasWifi }),
      ...(data.busType && { busType: data.busType }),
    },
  });

  await logAudit({
    entityType: "bus",
    entityId: bus.id,
    action: "UPDATE",
    oldValues: existing,
    newValues: data,
  });

  return NextResponse.json(bus);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.bus.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
  }

  const bus = await prisma.bus.update({
    where: { id: params.id },
    data: { status: "RETIRED" },
  });

  await logAudit({
    entityType: "bus",
    entityId: bus.id,
    action: "STATUS_CHANGE",
    oldValues: { status: existing.status },
    newValues: { status: "RETIRED" },
  });

  return NextResponse.json({ success: true });
}
