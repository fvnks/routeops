import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBusSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { plateNumber: { contains: search, mode: "insensitive" } },
      { internalCode: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  const [buses, total] = await Promise.all([
    prisma.bus.findMany({
      where,
      include: { _count: { select: { assignments: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { plateNumber: "asc" },
    }),
    prisma.bus.count({ where }),
  ]);

  return NextResponse.json({ data: buses, total, page, limit });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createBusSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = validated.data;

  const existing = await prisma.bus.findUnique({ where: { plateNumber: data.plateNumber } });
  if (existing) {
    return NextResponse.json({ error: "Patente ya registrada" }, { status: 409 });
  }

  const bus = await prisma.bus.create({
    data: {
      plateNumber: data.plateNumber,
      internalCode: data.internalCode || null,
      model: data.model,
      brand: data.brand || null,
      year: data.year || null,
      capacity: data.capacity,
      hasAC: data.hasAC,
      hasWifi: data.hasWifi,
      busType: data.busType,
    },
  });

  await logAudit({
    entityType: "bus",
    entityId: bus.id,
    action: "CREATE",
    newValues: data,
  });

  return NextResponse.json(bus, { status: 201 });
}
