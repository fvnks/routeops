import { NextRequest, NextResponse } from "next/server";
import { getContingencyStats } from "@/lib/contingency-engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = to ? new Date(to) : new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const stats = await getContingencyStats(startDate, endDate);

  return NextResponse.json(stats);
}
