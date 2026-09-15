import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "singleton" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error al obtener settings:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, logoBase64, faviconUrl, primaryColor } = body;

    // Ensure settings exist
    await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });

    const settings = await prisma.settings.update({
      where: { id: "singleton" },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(logoBase64 !== undefined && { logoBase64 }),
        ...(faviconUrl !== undefined && { faviconUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error al actualizar settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.settings.update({
      where: { id: "singleton" },
      data: {
        companyName: null,
        logoBase64: null,
        faviconUrl: null,
        primaryColor: "#0f172a",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al resetear settings:", error);
    return NextResponse.json(
      { error: "Error al resetear configuración" },
      { status: 500 }
    );
  }
}
