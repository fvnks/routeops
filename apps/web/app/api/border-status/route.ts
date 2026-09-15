import { NextResponse } from "next/server";

const MOP_URL = "https://rest-sit.mop.gob.cl/arcgis/rest/services/VIALIDAD/Pasos_Fronterizos/MapServer/0/query";

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const url = `${MOP_URL}?where=PASO%3D'SCREDENTOR'&outFields=*&f=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "RouteOps/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`MOP API ${res.status}`);

    const json = await res.json();
    const feature = json.features?.[0]?.attributes;

    if (!feature) throw new Error("Feature not found");

    const transitabilidad = feature.TRANSITABILIDAD || "SIN INFORMACIÓN";
    const isOpen = transitabilidad.includes("SIN RESTRICCIÓN");
    const isRestricted = transitabilidad.includes("CON RESTRICCIÓN");
    const isClosed = transitabilidad.includes("INTERRUMPIDO");

    let status: "open" | "restricted" | "closed" | "unknown" = "unknown";
    let statusLabel = "Sin información";
    let color = "gray";

    if (isOpen) { status = "open"; statusLabel = "Abierto"; color = "green"; }
    else if (isRestricted) { status = "restricted"; statusLabel = "Con restricciones"; color = "yellow"; }
    else if (isClosed) { status = "closed"; statusLabel = "Cerrado"; color = "red"; }

    const data = {
      name: "Paso Los Libertadores (Cristo Redentor)",
      status,
      statusLabel,
      color,
      transitabilidad: feature.TRANSITABILIDAD,
      clima: feature.ESTADOTIEMPO || "No disponible",
      calzada: feature.ESTADOCALZADA || null,
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
  } catch (error: any) {
    // Return last cached data if available, even if stale
    if (cache) return NextResponse.json(cache.data);

    return NextResponse.json({
      name: "Paso Los Libertadores (Cristo Redentor)",
      status: "unknown",
      statusLabel: "No disponible",
      color: "gray",
      transitabilidad: null,
      clima: "No disponible",
      calzada: null,
      restricciones: null,
      cadenas: null,
      habilitado: null,
      detalle: null,
      lastUpdate: null,
      source: "Dirección de Vialidad - MOP Chile",
      error: error?.message || "Error de conexión",
    });
  }
}
