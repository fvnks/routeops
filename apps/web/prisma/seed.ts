import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando base de datos...");

  // Crear usuario administrador
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
      permissions: [],
    },
  });
  console.log("✅ Usuario admin creado (admin / admin123)");

  // Crear conductores
  const driverData = [
    { firstName: "Juan", lastName: "Pérez", licenseNumber: "CH-001", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Carlos", lastName: "Soto", licenseNumber: "CH-002", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Pedro", lastName: "González", licenseNumber: "CH-003", baseLocation: "San Felipe", canNational: true, canInternational: true },
    { firstName: "Luis", lastName: "Morales", licenseNumber: "CH-004", baseLocation: "Santiago", canNational: true, canInternational: false },
    { firstName: "Andrés", lastName: "Fernández", licenseNumber: "CH-005", baseLocation: "Los Andes", canNational: true, canInternational: true },
    { firstName: "Miguel", lastName: "Rodríguez", licenseNumber: "CH-006", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Roberto", lastName: "Díaz", licenseNumber: "CH-007", baseLocation: "San Felipe", canNational: true, canInternational: false },
    { firstName: "Francisco", lastName: "Cáceres", licenseNumber: "CH-008", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Jorge", lastName: "Vargas", licenseNumber: "CH-009", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Ricardo", lastName: "Torres", licenseNumber: "CH-010", baseLocation: "Los Andes", canNational: true, canInternational: true },
    { firstName: "Sergio", lastName: "Ruiz", licenseNumber: "CH-011", baseLocation: "Santiago", canNational: true, canInternational: false },
    { firstName: "Patricio", lastName: "Castillo", licenseNumber: "CH-012", baseLocation: "San Felipe", canNational: true, canInternational: true },
    { firstName: "Claudio", lastName: "Herrera", licenseNumber: "CH-013", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Eduardo", lastName: "Sepúlveda", licenseNumber: "CH-014", baseLocation: "Santiago", canNational: true, canInternational: false },
    { firstName: "Gonzalo", lastName: "Fuentes", licenseNumber: "CH-015", baseLocation: "Los Andes", canNational: true, canInternational: true },
    { firstName: "Alejandro", lastName: "Mendoza", licenseNumber: "CH-016", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Felipe", lastName: "Arriagada", licenseNumber: "CH-017", baseLocation: "San Felipe", canNational: true, canInternational: false },
    { firstName: "Nicolás", lastName: "Peña", licenseNumber: "CH-018", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Matías", lastName: "Vega", licenseNumber: "CH-019", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Cristian", lastName: "Ríos", licenseNumber: "CH-020", baseLocation: "Los Andes", canNational: true, canInternational: false },
    { firstName: "Daniel", lastName: "Espinoza", licenseNumber: "CH-021", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Rodrigo", lastName: "Guzmán", licenseNumber: "CH-022", baseLocation: "San Felipe", canNational: true, canInternational: true },
    { firstName: "Víctor", lastName: "Reyes", licenseNumber: "CH-023", baseLocation: "Santiago", canNational: true, canInternational: false },
    { firstName: "Marcelo", lastName: "Silva", licenseNumber: "CH-024", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Fabián", lastName: "Contreras", licenseNumber: "CH-025", baseLocation: "Los Andes", canNational: true, canInternational: true },
    { firstName: "Hugo", lastName: "Navarro", licenseNumber: "CH-026", baseLocation: "Santiago", canNational: true, canInternational: false },
    { firstName: "Raúl", lastName: "Olivares", licenseNumber: "CH-027", baseLocation: "San Felipe", canNational: true, canInternational: true },
    { firstName: "Óscar", lastName: "Campos", licenseNumber: "CH-028", baseLocation: "Santiago", canNational: true, canInternational: true },
    { firstName: "Ignacio", lastName: "Flores", licenseNumber: "CH-029", baseLocation: "Santiago", canNational: true, canInternational: false },
    { firstName: "Tomás", lastName: "Acuña", licenseNumber: "CH-030", baseLocation: "Los Andes", canNational: true, canInternational: true },
  ];

  for (const d of driverData) {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 2);

    const driver = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: {
        firstName: d.firstName,
        lastName: d.lastName,
        licenseNumber: d.licenseNumber,
        licenseExpiry: expiry,
        baseLocation: d.baseLocation,
        canNational: d.canNational,
        canInternational: d.canInternational,
        phone: `+569${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
        email: `${d.firstName.toLowerCase()}.${d.lastName.toLowerCase()}@email.com`,
      },
    });

    await prisma.driverRestriction.upsert({
      where: { driverId: driver.id },
      update: {},
      create: {
        driverId: driver.id,
        minRestHours: 10,
        maxConsecutiveDays: 6,
      },
    });
  }
  console.log(`✅ ${driverData.length} conductores creados`);

  // Crear buses
  const busData = [
    { plateNumber: "ABCD-12", internalCode: "B-001", brand: "Mercedes-Benz", model: "O500", capacity: 50, busType: "standard" },
    { plateNumber: "EFGH-34", internalCode: "B-002", brand: "Mercedes-Benz", model: "O500", capacity: 50, busType: "standard" },
    { plateNumber: "IJKL-56", internalCode: "B-003", brand: "Scania", model: "K360", capacity: 50, busType: "standard" },
    { plateNumber: "MNOP-78", internalCode: "B-004", brand: "Scania", model: "K360", capacity: 50, busType: "standard" },
    { plateNumber: "QRST-90", internalCode: "B-005", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "UVWX-12", internalCode: "B-006", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "YZAB-34", internalCode: "B-007", brand: "Mercedes-Benz", model: "O500", capacity: 45, busType: "semi_cama" },
    { plateNumber: "CDEF-56", internalCode: "B-008", brand: "Scania", model: "K360", capacity: 45, busType: "semi_cama" },
    { plateNumber: "GHIJ-78", internalCode: "B-009", brand: "Volvo", model: "B12R", capacity: 45, busType: "semi_cama" },
    { plateNumber: "KLMN-90", internalCode: "B-010", brand: "Mercedes-Benz", model: "O500", capacity: 40, busType: "cama" },
    { plateNumber: "OPQR-12", internalCode: "B-011", brand: "Scania", model: "K360", capacity: 40, busType: "cama" },
    { plateNumber: "STUV-34", internalCode: "B-012", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "WXAB-56", internalCode: "B-013", brand: "Mercedes-Benz", model: "O500", capacity: 50, busType: "standard" },
    { plateNumber: "CDEF-90", internalCode: "B-014", brand: "Scania", model: "K360", capacity: 50, busType: "standard" },
    { plateNumber: "GHIJ-12", internalCode: "B-015", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "KLMN-34", internalCode: "B-016", brand: "Mercedes-Benz", model: "O500", capacity: 45, busType: "semi_cama" },
    { plateNumber: "OPQR-56", internalCode: "B-017", brand: "Scania", model: "K360", capacity: 45, busType: "semi_cama" },
    { plateNumber: "STUV-78", internalCode: "B-018", brand: "Volvo", model: "B12R", capacity: 45, busType: "semi_cama" },
    { plateNumber: "WXAB-90", internalCode: "B-019", brand: "Mercedes-Benz", model: "O500", capacity: 40, busType: "cama" },
    { plateNumber: "CDEF-34", internalCode: "B-020", brand: "Scania", model: "K360", capacity: 40, busType: "cama" },
    { plateNumber: "GHIJ-56", internalCode: "B-021", brand: "Mercedes-Benz", model: "O500", capacity: 50, busType: "standard" },
    { plateNumber: "KLMN-78", internalCode: "B-022", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "OPQR-90", internalCode: "B-023", brand: "Scania", model: "K360", capacity: 50, busType: "standard" },
    { plateNumber: "STUV-12", internalCode: "B-024", brand: "Mercedes-Benz", model: "O500", capacity: 45, busType: "semi_cama" },
    { plateNumber: "WXCD-34", internalCode: "B-025", brand: "Volvo", model: "B12R", capacity: 45, busType: "semi_cama" },
    { plateNumber: "EFGH-56", internalCode: "B-026", brand: "Scania", model: "K360", capacity: 50, busType: "standard" },
    { plateNumber: "IJKL-78", internalCode: "B-027", brand: "Mercedes-Benz", model: "O500", capacity: 50, busType: "standard" },
    { plateNumber: "MNOP-90", internalCode: "B-028", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "QRST-12", internalCode: "B-029", brand: "Scania", model: "K360", capacity: 40, busType: "cama" },
    { plateNumber: "UVWX-34", internalCode: "B-030", brand: "Mercedes-Benz", model: "O500", capacity: 40, busType: "cama" },
    { plateNumber: "YZAB-56", internalCode: "B-031", brand: "Volvo", model: "B12R", capacity: 50, busType: "standard" },
    { plateNumber: "CDEF-78", internalCode: "B-032", brand: "Scania", model: "K360", capacity: 50, busType: "standard" },
  ];

  for (const b of busData) {
    await prisma.bus.upsert({
      where: { plateNumber: b.plateNumber },
      update: {},
      create: {
        plateNumber: b.plateNumber,
        internalCode: b.internalCode,
        brand: b.brand,
        model: b.model,
        capacity: b.capacity,
        busType: b.busType,
        hasAC: true,
        hasWifi: Math.random() > 0.5,
        year: 2018 + Math.floor(Math.random() * 6),
      },
    });
  }
  console.log(`✅ ${busData.length} buses creados`);

  // Crear rutas
  const routeData = [
    { name: "San Felipe → Santiago", code: "SFE-SCL", type: "NATIONAL", origin: "San Felipe", destination: "Santiago", estimatedDuration: 120, distanceKm: 180 },
    { name: "Santiago → San Felipe", code: "SCL-SFE", type: "NATIONAL", origin: "Santiago", destination: "San Felipe", estimatedDuration: 120, distanceKm: 180 },
    { name: "Los Andes → Santiago", code: "LDA-SCL", type: "NATIONAL", origin: "Los Andes", destination: "Santiago", estimatedDuration: 150, distanceKm: 200 },
    { name: "Santiago → Los Andes", code: "SCL-LDA", type: "NATIONAL", origin: "Santiago", destination: "Los Andes", estimatedDuration: 150, distanceKm: 200 },
    { name: "Santiago → Mendoza", code: "SCL-MDZ", type: "INTERNATIONAL", origin: "Santiago", destination: "Mendoza", estimatedDuration: 390, distanceKm: 400 },
    { name: "Mendoza → Santiago", code: "MDZ-SCL", type: "INTERNATIONAL", origin: "Mendoza", destination: "Santiago", estimatedDuration: 390, distanceKm: 400 },
    { name: "Santiago → Buenos Aires", code: "SCL-BUE", type: "INTERNATIONAL", origin: "Santiago", destination: "Buenos Aires", estimatedDuration: 840, distanceKm: 1200 },
    { name: "Buenos Aires → Santiago", code: "BUE-SCL", type: "INTERNATIONAL", origin: "Buenos Aires", destination: "Santiago", estimatedDuration: 840, distanceKm: 1200 },
  ];

  for (const r of routeData) {
    await prisma.route.upsert({
      where: { code: r.code },
      update: {},
      create: {
        name: r.name,
        code: r.code,
        type: r.type as any,
        origin: r.origin,
        destination: r.destination,
        estimatedDuration: r.estimatedDuration,
        distanceKm: r.distanceKm,
      },
    });
  }
  console.log(`✅ ${routeData.length} rutas creadas`);

  // Crear viajes de ejemplo para hoy y los próximos 6 días
  const routes = await prisma.route.findMany();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let tripCount = 0;
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);

    const timeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

    for (const route of routes) {
      const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const [hours, minutes] = slot.split(":").map(Number);
      const departureTime = new Date(date);
      departureTime.setHours(hours, minutes, 0, 0);

      const arrivalTime = new Date(departureTime.getTime() + route.estimatedDuration * 60000);

      const tripNumber = `VIAJE-${date.toISOString().split("T")[0]}-${String(tripCount + 1).padStart(3, "0")}`;

      await prisma.trip.upsert({
        where: { scheduledDate_tripNumber: { scheduledDate: date, tripNumber } },
        update: {},
        create: {
          routeId: route.id,
          tripNumber,
          scheduledDate: date,
          departureTime,
          arrivalTime,
          status: "SCHEDULED",
          tripType: route.type as any,
        },
      });
      tripCount++;
    }
  }
  console.log(`✅ ${tripCount} viajes creados para 7 días`);

  console.log("🎉 ¡Siembra completada!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
