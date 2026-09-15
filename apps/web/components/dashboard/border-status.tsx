"use client";

import { useEffect, useState } from "react";

interface WeatherForecast {
  location: string;
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

const riskConfig: Record<string, { bg: string; text: string; label: string; dot: string; border: string }> = {
  low:      { bg: "bg-green-50",  text: "text-green-800",  label: "Bajo",    dot: "bg-green-500",  border: "border-green-200" },
  medium:   { bg: "bg-yellow-50", text: "text-yellow-800", label: "Medio",   dot: "bg-yellow-500", border: "border-yellow-200" },
  high:     { bg: "bg-orange-50", text: "text-orange-800", label: "Alto",    dot: "bg-orange-500", border: "border-orange-200" },
  critical: { bg: "bg-red-50",    text: "text-red-800",    label: "Crítico", dot: "bg-red-500",    border: "border-red-200" },
  unknown:  { bg: "bg-gray-50",   text: "text-gray-600",   label: "N/D",     dot: "bg-gray-400",   border: "border-gray-200" },
};

export function BorderStatusWidget({ compact = false }: { compact?: boolean }) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    try {
      const res = await fetch("/api/weather");
      const data = await res.json();
      setWeather(data);
    } catch {
      // silent
    }
    setLoading(false);
  }

  const risk = weather?.risk;
  const rc = riskConfig[risk?.level || "unknown"] || riskConfig.unknown;

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${rc.bg} ${rc.border} border transition-colors hover:opacity-80`}
      >
        <span className={`h-2 w-2 rounded-full ${rc.dot} ${risk?.level === "low" ? "animate-pulse" : ""}`} />
        <span className={rc.text}>
          {loading ? "Consultando..." : `Cristo Redentor: ${rc.label}`}
        </span>
        {weather?.alert && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
            ❄️
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${rc.bg} ${rc.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Paso Los Libertadores</h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${rc.text}`}>
            <span className={`h-2 w-2 rounded-full ${rc.dot} ${risk?.level === "low" ? "animate-pulse" : ""}`} />
            {loading ? "Consultando..." : rc.label}
          </span>
        </div>
        {weather?.alert && (
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
            ❄️ {weather.alert}
          </span>
        )}
      </div>

      {/* Clima actual */}
      {weather?.current && (
        <div className="flex items-center gap-4 mb-3">
          <img
            src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
            alt=""
            className="w-14 h-14"
          />
          <div>
            <p className="text-2xl font-bold text-gray-900">{weather.current.temp}°C</p>
            <p className="text-sm text-gray-600 capitalize">{weather.current.weather}</p>
            <p className="text-xs text-gray-500">
              Sensación: {weather.current.feelsLike}°C · Viento: {weather.current.wind} km/h · Humedad: {weather.current.humidity}%
            </p>
          </div>
        </div>
      )}

      {/* Riesgo y factores */}
      {risk && risk.reasons.length > 0 && (
        <div className={`p-2 rounded text-xs ${rc.text} ${rc.bg} border ${rc.border} mb-3`}>
          <p className="font-semibold mb-1">Factores de riesgo:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {risk.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pronóstico por horas */}
      {weather && weather.forecast.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <span className="text-xs font-semibold text-gray-700">Pronóstico 24h</span>
            <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
          </button>

          {expanded && (
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
        </>
      )}

      <p className="mt-2 text-[10px] text-gray-400">
        {weather?.lastUpdate ? `Actualizado: ${new Date(weather.lastUpdate).toLocaleString("es-CL")}` : ""}
        {" · "}Fuente: OpenWeatherMap
      </p>
    </div>
  );
}
