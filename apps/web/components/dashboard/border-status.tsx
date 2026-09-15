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

interface WeatherForecast {
  current: { temp: number; feelsLike: number; weather: string; icon: string; wind: number; humidity: number } | null;
  forecast: {
    time: string;
    temp: number;
    weather: string;
    icon: string;
    wind: number;
    precipitation: number;
    snow: number;
    risk: { level: string; reasons: string[] };
  }[];
  risk: { level: string; reasons: string[] };
  alert: string | null;
  lastUpdate: string | null;
}

const riskConfig: Record<string, { bg: string; text: string; label: string; border: string }> = {
  low:      { bg: "bg-green-50",  text: "text-green-800",  label: "Bajo",    border: "border-green-200" },
  medium:   { bg: "bg-yellow-50", text: "text-yellow-800", label: "Medio",   border: "border-yellow-200" },
  high:     { bg: "bg-orange-50", text: "text-orange-800", label: "Alto",    border: "border-orange-200" },
  critical: { bg: "bg-red-50",    text: "text-red-800",    label: "Crítico", border: "border-red-200" },
  unknown:  { bg: "bg-gray-50",   text: "text-gray-600",   label: "N/D",     border: "border-gray-200" },
};

export function BorderStatusWidget({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<BorderStatus | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const previousStatus = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchStatus();
    fetchWeather();
    const interval = setInterval(fetchStatus, 10 * 60 * 1000);
    const weatherInterval = setInterval(fetchWeather, 2 * 60 * 60 * 1000);
    return () => { clearInterval(interval); clearInterval(weatherInterval); };
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

  async function fetchWeather() {
    try {
      const res = await fetch("/api/weather");
      const data = await res.json();
      setWeather(data);
    } catch {
      // silent
    }
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
          {weather?.risk && weather.risk.level !== "low" && weather.risk.level !== "unknown" && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${riskConfig[weather.risk.level]?.bg || ""} ${riskConfig[weather.risk.level]?.text || ""}`}>
              Clima: {riskConfig[weather.risk.level]?.label}
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

        {/* Pronóstico del tiempo */}
        {weather && weather.current && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <button
              onClick={() => setShowWeather(!showWeather)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-semibold text-gray-700">Pronóstico 24h</span>
              <div className="flex items-center gap-2">
                {weather.risk && weather.risk.level !== "low" && weather.risk.level !== "unknown" && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${riskConfig[weather.risk.level]?.bg} ${riskConfig[weather.risk.level]?.text}`}>
                    Riesgo: {riskConfig[weather.risk.level]?.label}
                  </span>
                )}
                <span className="text-gray-400 text-xs">{showWeather ? "▲" : "▼"}</span>
              </div>
            </button>

            {showWeather && (
              <div className="mt-2 space-y-2">
                {/* Clima actual */}
                <div className="flex items-center gap-3 p-2 bg-white/60 rounded">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                    alt=""
                    className="w-10 h-10"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{weather.current.temp}°C</p>
                    <p className="text-xs text-gray-500">{weather.current.weather} · Viento {weather.current.wind} km/h</p>
                  </div>
                </div>

                {/* Alerta de nieve */}
                {weather.alert && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 font-medium">
                    ❄️ {weather.alert}
                  </div>
                )}

                {/* Riesgo y razones */}
                {weather.risk && weather.risk.reasons.length > 0 && (
                  <div className={`p-2 rounded text-xs ${riskConfig[weather.risk.level]?.bg} ${riskConfig[weather.risk.level]?.text}`}>
                    <p className="font-semibold mb-1">Factores de riesgo:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {weather.risk.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pronóstico por horas */}
                {weather.forecast.length > 0 && (
                  <div className="grid grid-cols-4 gap-1">
                    {weather.forecast.map((f, i) => (
                      <div key={i} className="text-center p-1.5 bg-white/60 rounded">
                        <p className="text-[10px] text-gray-500">
                          {new Date(f.time).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <img
                          src={`https://openweathermap.org/img/wn/${f.icon}.png`}
                          alt=""
                          className="w-8 h-8 mx-auto"
                        />
                        <p className="text-xs font-medium text-gray-900">{f.temp}°</p>
                        {f.precipitation > 0 && (
                          <p className="text-[10px] text-blue-600">{f.precipitation}%</p>
                        )}
                        {f.snow > 0 && (
                          <p className="text-[10px] text-blue-700">❄️{f.snow}mm</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-gray-400">
                  Fuente: OpenWeatherMap · {weather.lastUpdate ? new Date(weather.lastUpdate).toLocaleString("es-CL") : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <BorderReassignModal
        open={showModal}
        onClose={() => setShowModal(false)}
        borderStatus={s?.status || "unknown"}
      />
    </>
  );
}
