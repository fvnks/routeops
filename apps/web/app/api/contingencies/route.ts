import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createContingency } from "@/lib/contingency-engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const severity = searchParams.get("severity");

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (severity) where.severity = severity;

  const contingencies = await prisma.contingency.findMany({
    where,
    include: {
      affectedTrip: {
        include: { route: true, assignments: { include: { driver: true, bus: true } } },
      },
      affectedDriver: true,
      affectedBus: true,
      replacementDriver: true,
      replacementBus: true,
      actions: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(contingencies);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, tripId, driverId, busId, reason, reportedBy } = body;

    if (!type || !reason) {
      return NextResponse.json(
        { error: "Tipo y razón son requeridos" },
        { status: 400 }
      );
    }

    const result = await createContingency({
      type,
      tripId,
      driverId,
      busId,
      reason,
      reportedBy,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error al crear contingencia:", error);
    return NextResponse.json(
      { error: "Error al crear contingencia" },
      { status: 500 }
    );
  }
}
