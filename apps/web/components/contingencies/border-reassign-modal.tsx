"use client";

import { useState, useEffect } from "react";

interface AffectedTrip {
  id: string;
  tripNumber: string;
  departureTime: string;
  route: {
    origin: string;
    destination: string;
    estimatedDuration: number;
  };
}

interface AffectedDriver {
  id: string;
  firstName: string;
  lastName: string;
  baseLocation: string;
  affectedTrip: AffectedTrip;
}

interface AffectedBus {
  id: string;
  plateNumber: string;
  internalCode: string | null;
  busType: string;
  affectedTrip: AffectedTrip;
}

interface AlternativeTrip {
  id: string;
  tripNumber: string;
  departureTime: string;
  route: {
    origin: string;
    destination: string;
    estimatedDuration: number;
  };
}

interface BorderAffectedData {
  affected: {
    trips: any[];
    drivers: AffectedDriver[];
    buses: AffectedBus[];
  };
  available: {
    drivers: any[];
    buses: any[];
  };
  alternativeTrips: AlternativeTrip[];
}

interface BorderReassignModalProps {
  open: boolean;
  onClose: () => void;
  borderStatus: string;
}

export function BorderReassignModal({ open, onClose, borderStatus }: BorderReassignModalProps) {
  const [data, setData] = useState<BorderAffectedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<string>("");
  const [selectedTrip, setSelectedTrip] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchAffectedData();
    }
  }, [open]);

  async function fetchAffectedData() {
    setLoading(true);
    try {
      const res = await fetch("/api/border-affected");
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error("Error al obtener datos afectados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReassign(driverId: string, busId: string, tripId: string) {
    setReassigning(tripId);
    try {
      // First, remove existing assignment from affected trip
      await fetch(`/api/trips?id=${tripId}`, { method: "DELETE" });

      // Then assign to new trip
      await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, driverId, busId }),
      });

      // Refresh data
      fetchAffectedData();
    } catch (error) {
      console.error("Error al reasignar:", error);
    } finally {
      setReassigning(null);
    }
  }

  async function handleCancelTrip(tripId: string) {
    try {
      await fetch(`/api/trips?id=${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      fetchAffectedData();
    } catch (error) {
      console.error("Error al cancelar viaje:", error);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-xl">🚧</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Frontera con Restricciones
                </h2>
                <p className="text-sm text-gray-500">
                  Recursos afectados disponibles para reasignar
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : !data || (data.affected.drivers.length === 0 && data.affected.buses.length === 0) ? (
              <div className="text-center py-8">
                <span className="text-4xl">✅</span>
                <p className="mt-4 text-lg font-medium text-gray-900">Sin recursos afectados</p>
                <p className="text-sm text-gray-500">
                  No hay viajes internacionales programados para hoy
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Affected Drivers */}
                {data.affected.drivers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      👤 Conductores Afectados ({data.affected.drivers.length})
                    </h3>
                    <div className="space-y-2">
                      {data.affected.drivers.map((driver) => (
                        <div
                          key={driver.id}
                          className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {driver.firstName} {driver.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Viaje: {driver.affectedTrip.tripNumber} · {driver.affectedTrip.route.origin}→{driver.affectedTrip.route.destination}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedDriver === driver.id ? selectedTrip : ""}
                              onChange={(e) => {
                                setSelectedDriver(driver.id);
                                setSelectedTrip(e.target.value);
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Reasignar a...</option>
                              {data.alternativeTrips.map((trip) => (
                                <option key={trip.id} value={trip.id}>
                                  {trip.tripNumber} · {trip.route.origin}→{trip.route.destination}
                                </option>
                              ))}
                            </select>
                            {selectedDriver === driver.id && selectedTrip && (
                              <button
                                onClick={() => {
                                  const busId = data.available.buses[0]?.id;
                                  if (busId) handleReassign(driver.id, busId, selectedTrip);
                                }}
                                disabled={reassigning === selectedTrip}
                                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {reassigning === selectedTrip ? "..." : "OK"}
                              </button>
                            )}
                            <button
                              onClick={() => handleCancelTrip(driver.affectedTrip.id)}
                              className="px-3 py-1 text-red-600 text-sm font-medium hover:text-red-800"
                            >
                              Cancelar viaje
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affected Buses */}
                {data.affected.buses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      🚌 Buses Afectados ({data.affected.buses.length})
                    </h3>
                    <div className="space-y-2">
                      {data.affected.buses.map((bus) => (
                        <div
                          key={bus.id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 font-mono">
                              {bus.plateNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              Viaje: {bus.affectedTrip.tripNumber} · {bus.affectedTrip.route.origin}→{bus.affectedTrip.route.destination}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              Disponible para reasignar a rutas nacionales
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available for Reassignment */}
                {(data.available.drivers.length > 0 || data.available.buses.length > 0) && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">
                      ✅ Recursos Disponibles para Reasignar
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-green-700">
                          <span className="font-medium">{data.available.drivers.length}</span> conductores internacionales disponibles
                        </p>
                      </div>
                      <div>
                        <p className="text-green-700">
                          <span className="font-medium">{data.available.buses.length}</span> buses internacionales disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative Trips */}
                {data.alternativeTrips.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      🗺️ Viajes Nacionales Sin Asignar (Reasignación Rápida)
                    </h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {data.alternativeTrips.map((trip) => (
                        <div
                          key={trip.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div>
                            <span className="font-mono text-gray-600">{trip.tripNumber}</span>
                            <span className="ml-2 text-gray-900">
                              {trip.route.origin}→{trip.route.destination}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(trip.departureTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
