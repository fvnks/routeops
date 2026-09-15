"use client";

import { useEffect, useState } from "react";

interface BorderStatus {
  name: string;
  status: "open" | "restricted" | "closed" | "unknown";
  statusLabel: string;
  color: string;
  transitabilidad: string;
  clima: string;
  calzada: string;
  restricciones: string | null;
  cadenas: string | null;
  habilitado: string | null;
  detalle: string | null;
  lastUpdate: string | null;
  source: string;
}

export function BorderStatusWidget() {
  const [status, setStatus] = useState<BorderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10 * 60 * 1000); // refresh every 10 min
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/border-status");
      if (res.ok) setStatus(await res.json());
    } catch {}
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Cargando estado del paso...</p>
      </div>
    );
  }

  if (!status) return null;

  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const dotColor: Record<string, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-400",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Paso Los Libertadores</h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status.color] || colorMap.gray}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status.color] || dotColor.gray}`} />
          {status.statusLabel}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Clima:</span>
          <span className="text-gray-900">{status.clima}</span>
        </div>
        {status.calzada && status.calzada !== "No disponible" && (
          <div className="flex justify-between">
            <span className="text-gray-500">Calzada:</span>
            <span className="text-gray-900">{status.calzada}</span>
          </div>
        )}
        {status.restricciones && (
          <div className="flex justify-between">
            <span className="text-gray-500">Restricciones:</span>
            <span className="text-orange-700 font-medium">{status.restricciones}</span>
          </div>
        )}
        {status.cadenas && (
          <div className="flex justify-between">
            <span className="text-gray-500">Cadenas:</span>
            <span className="text-gray-900">{status.cadenas}</span>
          </div>
        )}
        {status.habilitado && (
          <div className="flex justify-between">
            <span className="text-gray-500">Habilitado:</span>
            <span className="text-gray-900">{status.habilitado}</span>
          </div>
        )}
      </div>

      {status.detalle && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 whitespace-pre-line">
          {status.detalle}
        </div>
      )}

      <div className="mt-3 text-[10px] text-gray-400">
        {status.lastUpdate && `Actualizado: ${new Date(status.lastUpdate).toLocaleString("es-CL")}`}
        {" · "}Fuente: {status.source}
      </div>
    </div>
  );
}
