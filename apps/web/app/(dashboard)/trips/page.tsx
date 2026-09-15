"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { TripTable } from "@/components/trips/trip-table";
import { formatDate } from "@/lib/utils";
import type { TripWithDetails } from "@/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchTrips();
  }, [date]);

  async function fetchTrips() {
    setLoading(true);
    const res = await fetch(`/api/trips?date=${date}&limit=100`);
    const data = await res.json();
    setTrips(data.data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viajes</h1>
          <p className="text-gray-500">{trips.length} viajes para {formatDate(date)}</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <Link
            href="/trips/new"
            className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            + Nuevo Viaje
          </Link>
        </div>
      </div>

      <TripTable data={trips} loading={loading} />
    </div>
  );
}
