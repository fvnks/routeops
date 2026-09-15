import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContingency } from "@/lib/contingency-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contingency = await prisma.contingency.findUnique({
    where: { id: params.id },
    include: {
      affectedTrip: {
        include: {
          route: true,
          assignments: { include: { driver: true, bus: true } },
        },
      },
      affectedDriver: true,
      affectedBus: true,
      replacementDriver: true,
      replacementBus: true,
      actions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!contingency) {
    return NextResponse.json(
      { error: "Contingencia no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(contingency);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const contingency = await prisma.contingency.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(contingency);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar contingencia" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contingency.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar contingencia" },
      { status: 500 }
    );
  }
}
