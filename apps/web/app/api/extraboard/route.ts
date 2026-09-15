import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAvailableExtraboard,
  createExtraboardSchedule,
  getExtraboardStats,
} from "@/lib/extraboard-manager";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const stats = searchParams.get("stats");

  if (stats === "true") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const startDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();
    const result = await getExtraboardStats(startDate, endDate);
    return NextResponse.json(result);
  }

  const targetDate = date ? new Date(date) : new Date();
  const extraboard = await getAvailableExtraboard(targetDate);

  return NextResponse.json(extraboard);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, date, reportTime, shiftType } = body;

    if (!driverId || !date || !reportTime) {
      return NextResponse.json(
        { error: "driverId, date y reportTime son requeridos" },
        { status: 400 }
      );
    }

    const result = await createExtraboardSchedule(
      driverId,
      new Date(date),
      reportTime,
      shiftType
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.extraboard, { status: 201 });
  } catch (error) {
    console.error("Error al crear extraboard:", error);
    return NextResponse.json(
      { error: "Error al crear programación de extraboard" },
      { status: 500 }
    );
  }
}
