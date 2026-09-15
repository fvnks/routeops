import { NextResponse } from "next/server";

const MOP_URL = "https://rest-sit.mop.gob.cl/arcgis/rest/services/VIALIDAD/Pasos_Fronterizos/MapServer/0/query";
const CRISTO_RENTOR_FILTER = "PASO='SCREDENTOR'";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

let cache: { data: any; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const params = new URLSearchParams({
      where: CRISTO_RENTOR_FILTER,
      outFields: "*",
      f: "json",
    });

    const res = await fetch(`${MOP_URL}?${params}`, {
      next: { revalidate: 600 }, // 10 min cache at fetch level
    });

    const json = await res.json();
    const feature = json.features?.[0]?.attributes;

    if (!feature) {
      return NextResponse.json(
        { error: "Paso no encontrado" },
        { status: 404 }
      );
    }

    const transitabilidad = feature.TRANSITABILIDAD || "SIN INFORMACIÓN";
    const isOpen = transitabilidad.includes("SIN RESTRICCIÓN");
    const isRestricted = transitabilidad.includes("CON RESTRICCIÓN");
    const isClosed = transitabilidad.includes("INTERRUMPIDO");

    let status: "open" | "restricted" | "closed" | "unknown" = "unknown";
    let statusLabel = "Sin información";
    let color = "gray";

    if (isOpen) {
      status = "open";
      statusLabel = "Abierto";
      color = "green";
    } else if (isRestricted) {
      status = "restricted";
      statusLabel = "Con restricciones";
      color = "yellow";
    } else if (isClosed) {
      status = "closed";
      statusLabel = "Cerrado";
      color = "red";
    }

    const data = {
      name: "Paso Los Libertadores (Cristo Redentor)",
      status,
      statusLabel,
      color,
      transitabilidad: feature.TRANSITABILIDAD,
      clima: feature.ESTADOTIEMPO || "No disponible",
      calzada: feature.ESTADOCALZADA || "No disponible",
      restricciones: feature.RESTRICCIONES || null,
      cadenas: feature.CADENAS || null,
      habilitado: feature.HABILITADO || null,
      detalle: feature.DETALLE1 || null,
      lastUpdate: feature.FECHA_ACTUALIZACION
        ? new Date(feature.FECHA_ACTUALIZACION).toISOString()
        : null,
      source: "Dirección de Vialidad - MOP Chile",
    };

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al consultar estado del paso" },
      { status: 500 }
    );
  }
}
