import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const driver = await prisma.driver.findUnique({
    where: { id: params.id },
    include: {
      vacations: true,
      redDays: true,
      restrictions: true,
    },
  });

  if (!driver) {
    return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 });
  }

  const where: any = { driverId: params.id };
  if (from) where.trip = { scheduledDate: { gte: new Date(from) } };
  if (to) where.trip = { scheduledDate: { lte: new Date(to) } };

  const assignments = await prisma.tripAssignment.findMany({
    where: { driverId: params.id, trip: { scheduledDate: { gte: new Date(from || new Date()), lte: new Date(to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) } } },
    include: { trip: { include: { route: true } } },
  });

  return NextResponse.json({
    driver: { id: driver.id, firstName: driver.firstName, lastName: driver.lastName },
    vacations: driver.vacations,
    redDays: driver.redDays,
    restrictions: driver.restrictions,
    assignments,
  });
}
