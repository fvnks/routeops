import { NextResponse } from "next/server";

const API_KEY = "91f66c4cc01b3f4934c1cae58d209b5c";
const LAT = -32.8;
const LON = -70.1;

interface HourlyWeather {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather: { main: string; description: string; icon: string }[];
  pop: number;
  rain?: { "1h"?: number };
  snow?: { "1h"?: number };
}

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 horas

function evaluateRisk(hour: HourlyWeather): { level: "low" | "medium" | "high" | "critical"; reasons: string[] } {
  const reasons: string[] = [];
  let riskScore = 0;

  // Temperatura bajo cero
  if (hour.temp <= -5) {
    riskScore += 3;
    reasons.push(`Temperatura muy baja: ${Math.round(hour.temp)}°C`);
  } else if (hour.temp <= 0) {
    riskScore += 2;
    reasons.push(`Temperatura bajo cero: ${Math.round(hour.temp)}°C`);
  } else if (hour.temp <= 3) {
    riskScore += 1;
    reasons.push(`Temperatura baja: ${Math.round(hour.temp)}°C`);
  }

  // Nieve
  if (hour.snow && hour.snow["1h"] && hour.snow["1h"] > 0) {
    riskScore += 3;
    reasons.push(`Nieve: ${hour.snow["1h"]}mm/h`);
  }

  // Lluvia fuerte
  if (hour.rain && hour.rain["1h"] && hour.rain["1h"] > 5) {
    riskScore += 2;
    reasons.push(`Lluvia intensa: ${hour.rain["1h"]}mm/h`);
  } else if (hour.rain && hour.rain["1h"] && hour.rain["1h"] > 2) {
    riskScore += 1;
    reasons.push(`Lluvia moderada: ${hour.rain["1h"]}mm/h`);
  }

  // Viento fuerte
  const windKmh = hour.wind_speed * 3.6;
  if (windKmh > 80) {
    riskScore += 3;
    reasons.push(`Vientos huracanados: ${Math.round(windKmh)} km/h`);
  } else if (windKmh > 60) {
    riskScore += 2;
    reasons.push(`Vientos fuertes: ${Math.round(windKmh)} km/h`);
  } else if (windKmh > 40) {
    riskScore += 1;
    reasons.push(`Vientos moderados: ${Math.round(windKmh)} km/h`);
  }

  // Lluvia congelante / aguanieve
  if (hour.weather[0]?.main === "Drizzle" && hour.temp <= 2) {
    riskScore += 2;
    reasons.push("Aguanieve posible");
  }

  // Niebla en zona de alta montaña
  if (hour.weather[0]?.main === "Fog" || hour.weather[0]?.main === "Mist") {
    riskScore += 1;
    reasons.push("Niebla en la zona");
  }

  // Neblina
  if (hour.weather[0]?.description?.includes("mist") || hour.weather[0]?.description?.includes("fog")) {
    riskScore += 1;
    reasons.push("Visibilidad reducida");
  }

  let level: "low" | "medium" | "high" | "critical" = "low";
  if (riskScore >= 6) level = "critical";
  else if (riskScore >= 4) level = "high";
  else if (riskScore >= 2) level = "medium";

  return { level, reasons };
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=es`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!res.ok) throw new Error(`OpenWeatherMap API ${res.status}`);

    const json = await res.json();
    const hourly = json.list as HourlyWeather[];

    // Evaluar las próximas 24 horas (8 pronósticos de 3h)
    const next24h = hourly.slice(0, 8);
    const forecast = next24h.map((h) => ({
      time: new Date(h.dt * 1000).toISOString(),
      temp: Math.round(h.temp),
      feelsLike: Math.round(h.feels_like),
      weather: h.weather[0]?.description || "—",
      icon: h.weather[0]?.icon || "01d",
      wind: Math.round(h.wind_speed * 3.6),
      humidity: h.humidity,
      precipitation: h.pop ? Math.round(h.pop * 100) : 0,
      rain: h.rain?.["1h"] || 0,
      snow: h.snow?.["1h"] || 0,
      risk: evaluateRisk(h),
    }));

    // Riesgo general = el peor de las próximas 24h
    const worstRisk = forecast.reduce((worst, f) => {
      const levels = { low: 0, medium: 1, high: 2, critical: 3 };
      return levels[f.risk.level] > levels[worst.level] ? f.risk : worst;
    }, forecast[0].risk);

    // Clima actual
    const current = hourly[0];
    const currentWeather = {
      temp: Math.round(current.temp),
      feelsLike: Math.round(current.feels_like),
      weather: current.weather[0]?.description || "—",
      icon: current.weather[0]?.icon || "01d",
      wind: Math.round(current.wind_speed * 3.6),
      humidity: current.humidity,
    };

    // Alerta: ¿Algún pronóstico de nieve en las próximas 24h?
    const snowForecast = forecast.filter((f) => f.snow > 0);
    const alertMessage = snowForecast.length > 0
      ? `Nieve pronosticada en las próximas ${snowForecast.length * 3} horas`
      : null;

    const data = {
      location: json.city?.name || "Cristo Redentor",
      current: currentWeather,
      forecast,
      risk: worstRisk,
      alert: alertMessage,
      source: "OpenWeatherMap",
      lastUpdate: new Date().toISOString(),
    };

    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch (error: any) {
    if (cache) return NextResponse.json(cache.data);

    return NextResponse.json({
      location: "Cristo Redentor",
      current: null,
      forecast: [],
      risk: { level: "unknown", reasons: ["No se pudo obtener el pronóstico"] },
      alert: null,
      source: "OpenWeatherMap",
      lastUpdate: null,
      error: error?.message || "Error de conexión",
    });
  }
}
