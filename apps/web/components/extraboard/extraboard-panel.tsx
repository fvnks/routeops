"use client";

import { useState, useEffect } from "react";

interface ExtraboardEntry {
  id: string;
  driverId: string;
  date: string;
  reportTime: string;
  shiftType: string;
  status: string;
  driver: {
    firstName: string;
    lastName: string;
    baseLocation: string;
  };
}

interface ExtraboardPanelProps {
  date?: string;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  ON_DUTY: "bg-blue-100 text-blue-800",
  EXHAUSTED: "bg-red-100 text-red-800",
  OFF_DUTY: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  ON_DUTY: "En Servicio",
  EXHAUSTED: "Agotado",
  OFF_DUTY: "Fuera",
};

export function ExtraboardPanel({ date }: ExtraboardPanelProps) {
  const [extraboard, setExtraboard] = useState<ExtraboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const targetDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchExtraboard();
  }, [targetDate]);

  async function fetchExtraboard() {
    setLoading(true);
    const res = await fetch(`/api/extraboard?date=${targetDate}`);
    const data = await res.json();
    setExtraboard(data);
    setLoading(false);
  }

  const available = extraboard.filter((e) => e.status === "AVAILABLE").length;
  const onDuty = extraboard.filter((e) => e.status === "ON_DUTY").length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Extraboard</h3>
        <div className="flex gap-3 text-sm">
          <span className="text-green-600">{available} disponibles</span>
          <span className="text-blue-600">{onDuty} en servicio</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : extraboard.length === 0 ? (
        <p className="text-sm text-gray-500">No hay conductores extraboard programados para esta fecha</p>
      ) : (
        <div className="space-y-2">
          {extraboard.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {entry.driver.firstName} {entry.driver.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  Reporte: {entry.reportTime} · {entry.driver.baseLocation}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  statusColors[entry.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {statusLabels[entry.status] || entry.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
