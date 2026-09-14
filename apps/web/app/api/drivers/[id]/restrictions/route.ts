import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const driver = await prisma.driver.findUnique({ where: { id: params.id } });
  if (!driver) {
    return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 });
  }

  const restrictions = await prisma.driverRestriction.upsert({
    where: { driverId: params.id },
    update: {
      restrictedRoutes: body.restrictedRoutes || [],
      maxConsecutiveDays: body.maxConsecutiveDays || 6,
      minRestHours: body.minRestHours || 10,
      unavailableDays: body.unavailableDays || [],
    },
    create: {
      driverId: params.id,
      restrictedRoutes: body.restrictedRoutes || [],
      maxConsecutiveDays: body.maxConsecutiveDays || 6,
      minRestHours: body.minRestHours || 10,
      unavailableDays: body.unavailableDays || [],
    },
  });

  if (body.canNational !== undefined || body.canInternational !== undefined) {
    await prisma.driver.update({
      where: { id: params.id },
      data: {
        ...(body.canNational !== undefined && { canNational: body.canNational }),
        ...(body.canInternational !== undefined && { canInternational: body.canInternational }),
      },
    });
  }

  await logAudit({
    entityType: "driver",
    entityId: params.id,
    action: "UPDATE",
    newValues: body,
    description: "Restricciones actualizadas",
  });

  return NextResponse.json(restrictions);
}
