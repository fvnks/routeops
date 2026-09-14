import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMaintenanceSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const records = await prisma.maintenanceRecord.findMany({
    where: { busId: params.id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = createMaintenanceSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = validated.data;

  const bus = await prisma.bus.findUnique({ where: { id: params.id } });
  if (!bus) {
    return NextResponse.json({ error: "Bus no encontrado" }, { status: 404 });
  }

  const record = await prisma.maintenanceRecord.create({
    data: {
      busId: params.id,
      type: data.type,
      description: data.description || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      cost: data.cost || null,
      mileage: data.mileage || null,
    },
  });

  if (!data.endDate || data.endDate > new Date()) {
    await prisma.bus.update({
      where: { id: params.id },
      data: { status: "IN_MAINTENANCE" },
    });
  }

  await logAudit({
    entityType: "bus",
    entityId: params.id,
    action: "CREATE",
    newValues: record,
    description: "Registro de mantención creado",
  });

  return NextResponse.json(record, { status: 201 });
}
