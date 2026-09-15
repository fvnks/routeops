import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TripsToday } from "@/components/dashboard/trips-today";
import { UpcomingTrips } from "@/components/dashboard/upcoming-trips";
import { BorderStatusWidget } from "@/components/dashboard/border-status";
import { formatTime, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalDrivers, activeDrivers, totalBuses, availableBuses,
    todayTrips, assignedTrips,
    todayTripDetails, upcomingTrips,
  ] = await Promise.all([
    prisma.driver.count(),
    prisma.driver.count({ where: { status: "ACTIVE" } }),
    prisma.bus.count(),
    prisma.bus.count({ where: { status: "AVAILABLE" } }),
    prisma.trip.count({ where: { scheduledDate: { gte: today, lt: tomorrow } } }),
    prisma.tripAssignment.count({ where: { trip: { scheduledDate: { gte: today, lt: tomorrow } } } }),
    prisma.trip.findMany({
      where: { scheduledDate: { gte: today, lt: tomorrow } },
      include: { route: true, assignments: { include: { driver: true, bus: true } } },
      orderBy: { departureTime: "asc" },
    }),
    prisma.trip.findMany({
      where: { scheduledDate: { gte: tomorrow } },
      include: { route: true, assignments: { include: { driver: true } } },
      orderBy: { scheduledDate: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
          <p className="text-gray-500">Vista general de la operación</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <StatsCards
        totalDrivers={totalDrivers}
        activeDrivers={activeDrivers}
        totalBuses={totalBuses}
        availableBuses={availableBuses}
        todayTrips={todayTrips}
        assignedTrips={assignedTrips}
      />

      <BorderStatusWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TripsToday trips={todayTripDetails as any} />
        <UpcomingTrips trips={upcomingTrips as any} />
      </div>
    </div>
  );
}
