import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TripData {
  tripNumber: string;
  route: string;
  date: string;
  departure: string;
  driver: string;
  bus: string;
  status: string;
}

interface DriverData {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phone: string;
  status: string;
}

interface BusData {
  plateNumber: string;
  brand: string;
  model: string;
  year: number | null;
  status: string;
}

export function generateTripsReport(trips: TripData[], dateRange: string): jsPDF {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Reporte de Viajes", 14, 22);

  doc.setFontSize(10);
  doc.text(`Período: ${dateRange}`, 14, 30);
  doc.text(`Total: ${trips.length} viajes`, 14, 36);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["N° Viaje", "Ruta", "Fecha", "Salida", "Conductor", "Bus", "Estado"]],
    body: trips.map((t) => [
      t.tripNumber,
      t.route,
      t.date,
      t.departure,
      t.driver,
      t.bus,
      t.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  return doc;
}

export function generateDriversReport(drivers: DriverData[]): jsPDF {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Reporte de Conductores", 14, 22);

  doc.setFontSize(10);
  doc.text(`Total: ${drivers.length} conductores`, 14, 30);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["Nombre", "Apellido", "Licencia", "Teléfono", "Estado"]],
    body: drivers.map((d) => [
      d.firstName,
      d.lastName,
      d.licenseNumber,
      d.phone || "—",
      d.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  return doc;
}

export function generateBusesReport(buses: BusData[]): jsPDF {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Reporte de Buses", 14, 22);

  doc.setFontSize(10);
  doc.text(`Total: ${buses.length} buses`, 14, 30);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 36);

  autoTable(doc, {
    startY: 44,
    head: [["Patente", "Marca", "Modelo", "Año", "Estado"]],
    body: buses.map((b) => [
      b.plateNumber,
      b.brand,
      b.model,
      b.year?.toString() || "—",
      b.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  return doc;
}

export function generateWeeklyScheduleReport(
  trips: TripData[],
  weekStart: string,
  weekEnd: string
): jsPDF {
  const doc = new jsPDF("landscape");

  doc.setFontSize(20);
  doc.text("Plan Semanal", 14, 22);

  doc.setFontSize(10);
  doc.text(`Semana: ${weekStart} al ${weekEnd}`, 14, 30);
  doc.text(`Total viajes: ${trips.length}`, 14, 36);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["N° Viaje", "Ruta", "Fecha", "Hora", "Conductor", "Bus", "Estado"]],
    body: trips.map((t) => [
      t.tripNumber,
      t.route,
      t.date,
      t.departure,
      t.driver,
      t.bus,
      t.status,
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 40 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 },
    },
  });

  return doc;
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
