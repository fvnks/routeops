import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalDrivers,
    activeDrivers,
    totalBuses,
    availableBuses,
    todayTrips,
    assignedTrips,
  ] = await Promise.all([
    prisma.driver.count(),
    prisma.driver.count({ where: { status: "ACTIVE" } }),
    prisma.bus.count(),
    prisma.bus.count({ where: { status: "AVAILABLE" } }),
    prisma.trip.count({
      where: {
        scheduledDate: { gte: today, lt: tomorrow },
      },
    }),
    prisma.tripAssignment.count({
      where: {
        trip: {
          scheduledDate: { gte: today, lt: tomorrow },
        },
      },
    }),
  ]);

  const unassignedTrips = todayTrips - assignedTrips;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Vista general de la operación</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("es-CL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Viajes Hoy"
          value={todayTrips}
          subtitle={`${assignedTrips} asignados / ${unassignedTrips} sin asignar`}
          icon="🗓️"
          color={unassignedTrips > 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}
        />
        <StatsCard
          title="Conductores Activos"
          value={activeDrivers}
          subtitle={`de ${totalDrivers} totales`}
          icon="👤"
          color="border-blue-200 bg-blue-50"
        />
        <StatsCard
          title="Buses Disponibles"
          value={availableBuses}
          subtitle={`de ${totalBuses} totales`}
          icon="🚌"
          color="border-purple-200 bg-purple-50"
        />
        <StatsCard
          title="Asignación"
          value={todayTrips > 0 ? Math.round((assignedTrips / todayTrips) * 100) : 0}
          subtitle="% viajes asignados"
          icon="✅"
          color={assignedTrips === todayTrips && todayTrips > 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/planning" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900">Planificación</p>
                <p className="text-sm text-gray-500">Vista 7 días</p>
              </div>
            </Link>
            <Link href="/trips/new" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">➕</span>
              <div>
                <p className="font-medium text-gray-900">Nuevo Viaje</p>
                <p className="text-sm text-gray-500">Crear viaje</p>
              </div>
            </Link>
            <Link href="/drivers" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-medium text-gray-900">Conductores</p>
                <p className="text-sm text-gray-500">Gestionar</p>
              </div>
            </Link>
            <Link href="/import" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">📥</span>
              <div>
                <p className="font-medium text-gray-900">Importar</p>
                <p className="text-sm text-gray-500">Desde Excel</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Operacional</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Estado del Paso Los Libertadores</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Abierto
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Viajes internacionales hoy</span>
              <span className="text-sm font-medium text-gray-900">—</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Viajes nacionales hoy</span>
              <span className="text-sm font-medium text-gray-900">—</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Reservas disponibles</span>
              <span className="text-sm font-medium text-gray-900">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  suffix,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
  suffix?: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-gray-900">
          {value}{suffix || ""}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
