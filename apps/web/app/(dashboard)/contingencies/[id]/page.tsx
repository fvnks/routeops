"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { SeverityBadge, ContingencyStatusBadge, ContingencyTypeBadge } from "@/components/contingencies/severity-badge";
import { ReplacementOptions } from "@/components/contingencies/replacement-options";
import { ContingencyTimeline } from "@/components/contingencies/contingency-timeline";

interface ContingencyDetail {
  id: string;
  type: string;
  severity: string;
  status: string;
  reason: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  resolutionNotes: string | null;
  affectedTrip: {
    id: string;
    tripNumber: string;
    departureTime: string;
    route: { origin: string; destination: string; estimatedDuration: number };
    assignments: { driver: { firstName: string; lastName: string }; bus: { plateNumber: string } }[];
  } | null;
  affectedDriver: { firstName: string; lastName: string } | null;
  affectedBus: { plateNumber: string } | null;
  replacementDriver: { firstName: string; lastName: string } | null;
  replacementBus: { plateNumber: string } | null;
  actions: any[];
}

interface ReplacementOption {
  driverId: string;
  driverName: string;
  busId: string | null;
  busPlate: string | null;
  score: number;
  reasons: string[];
}

interface BusOption {
  busId: string;
  plateNumber: string;
  score: number;
}

export default function ContingencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contingency, setContingency] = useState<ContingencyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replacements, setReplacements] = useState<ReplacementOption[]>([]);
  const [buses, setBuses] = useState<BusOption[]>([]);
  const [loadingReplacements, setLoadingReplacements] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchContingency();
  }, [params.id]);

  async function fetchContingency() {
    setLoading(true);
    const res = await fetch(`/api/contingencies/${params.id}`);
    const data = await res.json();
    setContingency(data);
    setLoading(false);

    // If active and has a trip, fetch replacements
    if (data.status === "ACTIVE" && data.affectedTripId) {
      fetchReplacements(data.affectedTripId);
    }
  }

  async function fetchReplacements(tripId: string) {
    setLoadingReplacements(true);
    // Fetch replacement drivers
    const res = await fetch(`/api/contingencies/${params.id}`);
    const data = await res.json();

    // For now, we'll show the form options
    setLoadingReplacements(false);
  }

  async function handleResolve(resolution: string, replacementDriverId?: string, replacementBusId?: string) {
    setResolving(true);
    try {
      await fetch("/api/contingencies/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contingencyId: params.id,
          resolution,
          replacementDriverId,
          replacementBusId,
          performedBy: "dispatcher",
        }),
      });
      fetchContingency();
    } finally {
      setResolving(false);
    }
  }

  if (loading) return <LoadingPage />;
  if (!contingency) return <div className="text-center py-12 text-gray-500">Contingencia no encontrada</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Contingencia ${contingency.id.slice(0, 8)}...`}
        subtitle={contingency.reason || "Sin descripción"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ContingencyTypeBadge type={contingency.type} />
              <SeverityBadge severity={contingency.severity} size="md" />
              <ContingencyStatusBadge status={contingency.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Reportada</p>
                <p className="font-medium">{new Date(contingency.reportedAt).toLocaleString("es-CL")}</p>
              </div>
              {contingency.resolvedAt && (
                <div>
                  <p className="text-gray-500">Resuelta</p>
                  <p className="font-medium">{new Date(contingency.resolvedAt).toLocaleString("es-CL")}</p>
                </div>
              )}
              {contingency.affectedTrip && (
                <>
                  <div>
                    <p className="text-gray-500">Viaje Afectado</p>
                    <p className="font-medium">{contingency.affectedTrip.tripNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ruta</p>
                    <p className="font-medium">
                      {contingency.affectedTrip.route.origin} → {contingency.affectedTrip.route.destination}
                    </p>
                  </div>
                </>
              )}
              {contingency.affectedDriver && (
                <div>
                  <p className="text-gray-500">Conductor Afectado</p>
                  <p className="font-medium">
                    {contingency.affectedDriver.firstName} {contingency.affectedDriver.lastName}
                  </p>
                </div>
              )}
              {contingency.affectedBus && (
                <div>
                  <p className="text-gray-500">Bus Afectado</p>
                  <p className="font-medium">{contingency.affectedBus.plateNumber}</p>
                </div>
              )}
            </div>

            {contingency.resolution && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Resolución: {contingency.resolution}
                </p>
                {contingency.resolutionNotes && (
                  <p className="text-sm text-green-700 mt-1">{contingency.resolutionNotes}</p>
                )}
              </div>
            )}
          </div>

          {/* Replacement Options */}
          {contingency.status === "ACTIVE" && (
            <ReplacementOptions
              options={replacements}
              buses={buses}
              onSelect={(driverId, busId) => handleResolve("REASSIGNED", driverId, busId)}
              loading={loadingReplacements}
            />
          )}

          {/* Action Buttons */}
          {contingency.status === "ACTIVE" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve("CANCELLED")}
                  disabled={resolving}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Cancelar Viaje
                </button>
                <button
                  onClick={() => handleResolve("DELAYED")}
                  disabled={resolving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Reprogramar
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <ContingencyTimeline events={contingency.actions} />
        </div>
      </div>
    </div>
  );
}
