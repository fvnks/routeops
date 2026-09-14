import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVacationSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const vacations = await prisma.driverVacation.findMany({
    where: { driverId: params.id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(vacations);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = createVacationSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const { startDate, endDate, reason } = validated.data;

  if (endDate < startDate) {
    return NextResponse.json({ error: "Fecha de término debe ser posterior a fecha de inicio" }, { status: 400 });
  }

  const overlapping = await prisma.driverVacation.findFirst({
    where: {
      driverId: params.id,
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });

  if (overlapping) {
    return NextResponse.json({ error: "Ya existe vacación programada en ese rango de fechas" }, { status: 409 });
  }

  const vacation = await prisma.driverVacation.create({
    data: {
      driverId: params.id,
      startDate,
      endDate,
      reason: reason || null,
    },
  });

  await logAudit({
    entityType: "driver",
    entityId: params.id,
    action: "CREATE",
    newValues: vacation,
    description: "Vacación creada",
  });

  return NextResponse.json(vacation, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const vacationId = searchParams.get("vacationId");

  if (!vacationId) {
    return NextResponse.json({ error: "vacationId requerido" }, { status: 400 });
  }

  const vacation = await prisma.driverVacation.findUnique({ where: { id: vacationId } });
  if (!vacation || vacation.driverId !== params.id) {
    return NextResponse.json({ error: "Vacación no encontrada" }, { status: 404 });
  }

  await prisma.driverVacation.delete({ where: { id: vacationId } });

  await logAudit({
    entityType: "driver",
    entityId: params.id,
    action: "DELETE",
    oldValues: vacation,
    description: "Vacación eliminada",
  });

  return NextResponse.json({ success: true });
}
