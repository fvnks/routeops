import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDriverSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
    include: {
      restrictions: true,
      vacations: true,
      redDays: true,
      _count: { select: { assignments: true, vacations: true } },
    },
  });

  if (!driver) {
    return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 });
  }

  return NextResponse.json(driver);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = updateDriverSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.driver.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 });
  }

  const data = validated.data;

  const driver = await prisma.driver.update({
    where: { id: params.id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
      ...(data.licenseExpiry && { licenseExpiry: data.licenseExpiry }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.baseLocation && { baseLocation: data.baseLocation }),
      ...(data.canNational !== undefined && { canNational: data.canNational }),
      ...(data.canInternational !== undefined && { canInternational: data.canInternational }),
      ...(data.maxHoursPerWeek && { maxHoursPerWeek: data.maxHoursPerWeek }),
      ...(data.maxDaysPerWeek && { maxDaysPerWeek: data.maxDaysPerWeek }),
    },
    include: { restrictions: true },
  });

  await logAudit({
    entityType: "driver",
    entityId: driver.id,
    action: "UPDATE",
    oldValues: existing,
    newValues: data,
  });

  return NextResponse.json(driver);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.driver.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 });
  }

  const driver = await prisma.driver.update({
    where: { id: params.id },
    data: { status: "INACTIVE" },
  });

  await logAudit({
    entityType: "driver",
    entityId: driver.id,
    action: "STATUS_CHANGE",
    oldValues: { status: existing.status },
    newValues: { status: "INACTIVE" },
  });

  return NextResponse.json({ success: true });
}
