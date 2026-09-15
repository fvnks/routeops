"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  tripsByStatus: Record<string, number>;
  tripsByType: Record<string, number>;
  driversByStatus: Record<string, number>;
  busesByStatus: Record<string, number>;
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  async function fetchChartData() {
    try {
      const [tripsRes, driversRes, busesRes] = await Promise.all([
        fetch("/api/trips?limit=1000"),
        fetch("/api/drivers"),
        fetch("/api/buses"),
      ]);

      const tripsData = await tripsRes.json();
      const driversData = await driversRes.json();
      const busesData = await busesRes.json();

      const trips = tripsData.data || [];
      const drivers = driversData.data || [];
      const buses = busesData.data || [];

      const tripsByStatus: Record<string, number> = {};
      trips.forEach((t: any) => {
        tripsByStatus[t.status] = (tripsByStatus[t.status] || 0) + 1;
      });

      const tripsByType: Record<string, number> = {};
      trips.forEach((t: any) => {
        tripsByType[t.tripType] = (tripsByType[t.tripType] || 0) + 1;
      });

      const driversByStatus: Record<string, number> = {};
      drivers.forEach((d: any) => {
        driversByStatus[d.status] = (driversByStatus[d.status] || 0) + 1;
      });

      const busesByStatus: Record<string, number> = {};
      buses.forEach((b: any) => {
        busesByStatus[b.status] = (busesByStatus[b.status] || 0) + 1;
      });

      setData({ tripsByStatus, tripsByType, driversByStatus, busesByStatus });
    } catch (error) {
      console.error("Error al cargar datos de gráficos:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-48 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Viajes por Estado</h3>
        <div className="h-48">
          <Bar
            data={{
              labels: Object.keys(data.tripsByStatus).map((k) => STATUS_LABELS[k] || k),
              datasets: [
                {
                  data: Object.values(data.tripsByStatus),
                  backgroundColor: Object.keys(data.tripsByStatus).map((k) => STATUS_COLORS[k] || "#9CA3AF"),
                  borderRadius: 4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Viajes por Tipo</h3>
        <div className="h-48 flex items-center justify-center">
          <Doughnut
            data={{
              labels: ["Nacional", "Internacional"],
              datasets: [
                {
                  data: [
                    data.tripsByType["NATIONAL"] || 0,
                    data.tripsByType["INTERNATIONAL"] || 0,
                  ],
                  backgroundColor: ["#60A5FA", "#A78BFA"],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              cutout: "60%",
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Conductores por Estado</h3>
        <div className="h-48 flex items-center justify-center">
          <Doughnut
            data={{
              labels: Object.keys(data.driversByStatus).map((k) => STATUS_LABELS[k] || k),
              datasets: [
                {
                  data: Object.values(data.driversByStatus),
                  backgroundColor: Object.keys(data.driversByStatus).map((k) => STATUS_COLORS[k] || "#9CA3AF"),
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              cutout: "60%",
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Buses por Estado</h3>
        <div className="h-48 flex items-center justify-center">
          <Doughnut
            data={{
              labels: Object.keys(data.busesByStatus).map((k) => STATUS_LABELS[k] || k),
              datasets: [
                {
                  data: Object.values(data.busesByStatus),
                  backgroundColor: Object.keys(data.busesByStatus).map((k) => STATUS_COLORS[k] || "#9CA3AF"),
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              cutout: "60%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
