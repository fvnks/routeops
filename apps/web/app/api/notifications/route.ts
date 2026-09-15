import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (unreadOnly) where.read = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, entity, entityId, actionUrl } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        type: type || "INFO",
        title,
        message,
        entity: entity || null,
        entityId: entityId || null,
        actionUrl: actionUrl || null,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return NextResponse.json(
      { error: "Error al crear notificación" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } else if (ids && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar notificaciones:", error);
    return NextResponse.json(
      { error: "Error al actualizar notificaciones" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.notification.delete({ where: { id } });
    } else {
      await prisma.notification.deleteMany();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar notificaciones:", error);
    return NextResponse.json(
      { error: "Error al eliminar notificaciones" },
      { status: 500 }
    );
  }
}
