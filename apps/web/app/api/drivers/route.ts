import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDriverSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const canNational = searchParams.get("canNational");
  const canInternational = searchParams.get("canInternational");

  const where: any = {};
  if (status) where.status = status;
  if (canNational === "true") where.canNational = true;
  if (canInternational === "true") where.canInternational = true;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { licenseNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      include: { restrictions: true, _count: { select: { assignments: true, vacations: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { lastName: "asc" },
    }),
    prisma.driver.count({ where }),
  ]);

  return NextResponse.json({ data: drivers, total, page, limit });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createDriverSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = validated.data;

  const existing = await prisma.driver.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });

  if (existing) {
    return NextResponse.json({ error: "Número de licencia ya registrado" }, { status: 409 });
  }

  const driver = await prisma.driver.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      phone: data.phone || null,
      email: data.email || null,
      baseLocation: data.baseLocation,
      canNational: data.canNational,
      canInternational: data.canInternational,
      maxHoursPerWeek: data.maxHoursPerWeek,
      maxDaysPerWeek: data.maxDaysPerWeek,
      restrictions: {
        create: {
          minRestHours: 10,
          maxConsecutiveDays: 6,
        },
      },
    },
    include: { restrictions: true },
  });

  await logAudit({
    entityType: "driver",
    entityId: driver.id,
    action: "CREATE",
    newValues: data,
  });

  return NextResponse.json(driver, { status: 201 });
}
