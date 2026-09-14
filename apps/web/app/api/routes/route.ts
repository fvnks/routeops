import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const active = searchParams.get("active");
  const search = searchParams.get("search");

  const where: any = {};
  if (type) where.type = type;
  if (active !== null) where.active = active === "true";
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { origin: { contains: search, mode: "insensitive" } },
      { destination: { contains: search, mode: "insensitive" } },
    ];
  }

  const routes = await prisma.route.findMany({
    where,
    include: { _count: { select: { trips: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(routes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createRouteSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = validated.data;

  const existing = await prisma.route.findUnique({ where: { code: data.code } });
  if (existing) {
    return NextResponse.json({ error: "Código de ruta ya existe" }, { status: 409 });
  }

  const route = await prisma.route.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type,
      origin: data.origin,
      destination: data.destination,
      stops: data.stops,
      estimatedDuration: data.estimatedDuration,
      distanceKm: data.distanceKm || null,
      basePrice: data.basePrice,
    },
  });

  await logAudit({
    entityType: "route",
    entityId: route.id,
    action: "CREATE",
    newValues: data,
  });

  return NextResponse.json(route, { status: 201 });
}
