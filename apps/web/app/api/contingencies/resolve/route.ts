import { NextRequest, NextResponse } from "next/server";
import { resolveContingency } from "@/lib/contingency-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contingencyId, resolution, replacementDriverId, replacementBusId, notes, performedBy } = body;

    if (!contingencyId || !resolution) {
      return NextResponse.json(
        { error: "ID de contingencia y resolución son requeridos" },
        { status: 400 }
      );
    }

    const result = await resolveContingency(contingencyId, {
      resolution,
      replacementDriverId,
      replacementBusId,
      notes,
      performedBy,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al resolver contingencia:", error);
    return NextResponse.json(
      { error: "Error al resolver contingencia" },
      { status: 500 }
    );
  }
}
