"use client";

import { useEffect, useState, useRef } from "react";
import { BorderReassignModal } from "@/components/contingencies/border-reassign-modal";

interface BorderStatus {
  name: string;
  status: "open" | "restricted" | "closed" | "unknown";
  statusLabel: string;
  color: string;
  transitabilidad: string | null;
  clima: string;
  calzada: string | null;
  restricciones: string | null;
  cadenas: string | null;
  habilitado: string | null;
  detalle: string | null;
  lastUpdate: string | null;
  source: string;
  error?: string;
}

export function BorderStatusWidget({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<BorderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const previousStatus = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/border-status");
      const data = await res.json();

      if (!isFirstLoad.current && previousStatus.current && previousStatus.current !== data.status) {
        if (data.status === "restricted" || data.status === "closed") {
          setShowModal(true);
        }
      }

      previousStatus.current = data.status;
      isFirstLoad.current = false;
      setStatus(data);
    } catch {
      setStatus((prev) => prev || {
        name: "Paso Los Libertadores",
        status: "unknown",
        statusLabel: "Error de conexión",
        color: "gray",
        transitabilidad: null,
        clima: "—",
        calzada: null,
        restricciones: null,
        cadenas: null,
        habilitado: null,
        detalle: null,
        lastUpdate: null,
        source: "MOP Chile",
      });
    }
    setLoading(false);
  }

  const s = status;

  const colorMap: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    green:     { bg: "bg-green-50",  text: "text-green-800",  dot: "bg-green-500",  border: "border-green-200" },
    yellow:    { bg: "bg-yellow-50", text: "text-yellow-800", dot: "bg-yellow-500", border: "border-yellow-200" },
    red:       { bg: "bg-red-50",    text: "text-red-800",    dot: "bg-red-500",    border: "border-red-200" },
    gray:      { bg: "bg-gray-50",   text: "text-gray-600",   dot: "bg-gray-400",   border: "border-gray-200" },
  };

  const c = colorMap[s?.color || "gray"] || colorMap.gray;

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${c.bg} ${c.border} border transition-colors hover:opacity-80`}
        >
          <span className={`h-2 w-2 rounded-full ${c.dot} ${s?.status === "open" ? "animate-pulse" : ""}`} />
          <span className={c.text}>
            {loading ? "Consultando..." : s?.statusLabel || "—"}
          </span>
          {s?.restricciones && (
            <span className="text-xs text-orange-600 truncate max-w-[150px]">
              · {s.restricciones}
            </span>
          )}
        </button>

        <BorderReassignModal
          open={showModal}
          onClose={() => setShowModal(false)}
          borderStatus={s?.status || "unknown"}
        />
      </>
    );
  }

  return (
    <>
      <div className={`rounded-lg border p-4 ${c.bg} ${c.border}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Paso Los Libertadores</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${c.text}`}>
              <span className={`h-2 w-2 rounded-full ${c.dot} ${s?.status === "open" ? "animate-pulse" : ""}`} />
              {loading ? "Consultando..." : s?.statusLabel || "—"}
            </span>
            {(s?.status === "restricted" || s?.status === "closed") && (
              <button
                onClick={() => setShowModal(true)}
                className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded hover:bg-orange-200 transition-colors"
              >
                Reasignar recursos
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500">Clima: </span>
            <span className="text-gray-900">{s?.clima || "—"}</span>
          </div>
          {s?.calzada && (
            <div>
              <span className="text-gray-500">Calzada: </span>
              <span className="text-gray-900">{s.calzada}</span>
            </div>
          )}
          {s?.restricciones && (
            <div className="col-span-2">
              <span className="text-gray-500">Restricciones: </span>
              <span className="font-medium text-orange-700">{s.restricciones}</span>
            </div>
          )}
          {s?.cadenas && (
            <div className="col-span-2">
              <span className="text-gray-500">Cadenas: </span>
              <span className="text-gray-900">{s.cadenas}</span>
            </div>
          )}
        </div>

        {s?.detalle && (
          <div className="mt-2 p-2 bg-white/60 rounded text-xs text-gray-600 whitespace-pre-line max-h-20 overflow-y-auto">
            {s.detalle}
          </div>
        )}

        <p className="mt-2 text-[10px] text-gray-400">
          {s?.lastUpdate ? `Actualizado: ${new Date(s.lastUpdate).toLocaleString("es-CL")}` : ""}
          {" · "}Fuente: MOP Chile
        </p>
      </div>

      <BorderReassignModal
        open={showModal}
        onClose={() => setShowModal(false)}
        borderStatus={s?.status || "unknown"}
      />
    </>
  );
}
