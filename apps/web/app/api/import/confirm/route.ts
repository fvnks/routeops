import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DESTINATIONS } from "@/lib/constants";

interface ImportRow {
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, headers, rows } = body;

    if (!type || !headers || !rows) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const errors: string[] = [];
    let success = 0;

    // Map headers to lowercase for easier matching
    const headerMap: Record<string, number> = {};
    headers.forEach((h: string, i: number) => {
      headerMap[h.toLowerCase().replace(/\s+/g, "")] = i;
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (type === "drivers") {
          const firstName = row[headerMap["firstname"]];
          const lastName = row[headerMap["lastname"]];
          const licenseNumber = row[headerMap["licensenumber"]];

          if (!firstName || !lastName || !licenseNumber) {
            errors.push(`Fila ${i + 1}: Faltan campos requeridos (firstName, lastName, licenseNumber)`);
            continue;
          }

          // Check if license already exists
          const existing = await prisma.driver.findUnique({
            where: { licenseNumber },
          });

          if (existing) {
            errors.push(`Fila ${i + 1}: Licencia ${licenseNumber} ya existe`);
            continue;
          }

          await prisma.driver.create({
            data: {
              firstName,
              lastName,
              licenseNumber,
              email: row[headerMap["email"]] || null,
              phone: row[headerMap["phone"]] || null,
              baseLocation: row[headerMap["baselocation"]] || DESTINATIONS[0],
              licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            },
          });
          success++;
        } else if (type === "buses") {
          const plateNumber = row[headerMap["platenumber"]];
          const brand = row[headerMap["brand"]];
          const model = row[headerMap["model"]];

          if (!plateNumber || !brand || !model) {
            errors.push(`Fila ${i + 1}: Faltan campos requeridos (plateNumber, brand, model)`);
            continue;
          }

          const existing = await prisma.bus.findUnique({
            where: { plateNumber },
          });

          if (existing) {
            errors.push(`Fila ${i + 1}: Patente ${plateNumber} ya existe`);
            continue;
          }

          await prisma.bus.create({
            data: {
              plateNumber,
              brand,
              model,
              year: row[headerMap["year"]] ? parseInt(row[headerMap["year"]]) : null,
              capacity: row[headerMap["capacity"]] ? parseInt(row[headerMap["capacity"]]) : 50,
              busType: row[headerMap["bustype"]] || "standard",
            },
          });
          success++;
        } else if (type === "trips") {
          const routeCode = row[headerMap["routecode"]];
          const scheduledDate = row[headerMap["scheduleddate"]];
          const departureTime = row[headerMap["departuretime"]];

          if (!routeCode || !scheduledDate || !departureTime) {
            errors.push(`Fila ${i + 1}: Faltan campos requeridos (routeCode, scheduledDate, departureTime)`);
            continue;
          }

          // Find route
          const route = await prisma.route.findFirst({
            where: { code: routeCode },
          });

          if (!route) {
            errors.push(`Fila ${i + 1}: Ruta ${routeCode} no encontrada`);
            continue;
          }

          // Parse date
          const dateStr = scheduledDate.includes("T")
            ? scheduledDate
            : `${scheduledDate}T${departureTime}:00`;

          const tripDate = new Date(dateStr);
          const tripNumber = `VIAJE-${tripDate.toISOString().split("T")[0]}-${String(i + 1).padStart(3, "0")}`;

          await prisma.trip.create({
            data: {
              routeId: route.id,
              tripNumber,
              scheduledDate: tripDate,
              departureTime: tripDate,
              tripType: route.type,
              status: "SCHEDULED",
              notes: row[headerMap["notes"]] || null,
            },
          });
          success++;
        }
      } catch (err: any) {
        errors.push(`Fila ${i + 1}: ${err.message || "Error desconocido"}`);
      }
    }

    return NextResponse.json({ success, errors });
  } catch (error) {
    console.error("Error en importación:", error);
    return NextResponse.json(
      { error: "Error al procesar importación" },
      { status: 500 }
    );
  }
}
