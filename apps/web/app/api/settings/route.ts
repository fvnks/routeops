import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  id: "singleton",
  companyName: null as string | null,
  logoBase64: null as string | null,
  logoSize: 40,
  faviconUrl: null as string | null,
  primaryColor: "#0f172a",
};

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings || DEFAULT_SETTINGS);
  } catch (error) {
    // Table might not exist yet - return defaults
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, logoBase64, logoSize, faviconUrl, primaryColor } = body;

    // Try to find existing settings
    let settings = await prisma.settings.findFirst();

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(logoBase64 !== undefined && { logoBase64 }),
          ...(logoSize !== undefined && { logoSize }),
          ...(faviconUrl !== undefined && { faviconUrl }),
          ...(primaryColor !== undefined && { primaryColor }),
        },
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          id: "singleton",
          companyName: companyName || null,
          logoBase64: logoBase64 || null,
          logoSize: logoSize || 40,
          faviconUrl: faviconUrl || null,
          primaryColor: primaryColor || "#0f172a",
        },
      });
    }

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
    const settings = await prisma.settings.findFirst();
    if (settings) {
      await prisma.settings.update({
        where: { id: settings.id },
        data: {
          companyName: null,
          logoBase64: null,
          logoSize: 40,
          faviconUrl: null,
          primaryColor: "#0f172a",
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al resetear settings:", error);
    return NextResponse.json(
      { error: "Error al resetear configuración" },
      { status: 500 }
    );
  }
}
