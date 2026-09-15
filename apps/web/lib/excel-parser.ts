import * as XLSX from "xlsx";

export interface ParsedExcelData {
  headers: string[];
  rows: any[][];
  errors: string[];
}

export function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length === 0) {
          resolve({ headers: [], rows: [], errors: ["El archivo está vacío"] });
          return;
        }

        const headers = (jsonData[0] as string[]).map((h) => String(h || ""));
        const rows = jsonData.slice(1).filter((row) =>
          (row as any[]).some((cell) => cell !== null && cell !== undefined && cell !== "")
        );

        resolve({
          headers,
          rows: rows as any[][],
          errors: [],
        });
      } catch (error) {
        resolve({
          headers: [],
          rows: [],
          errors: ["Error al procesar el archivo Excel"],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        headers: [],
        rows: [],
        errors: ["Error al leer el archivo"],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

export function validateDriverImportRow(row: any[], headers: string[]): string[] {
  const errors: string[] = [];
  const requiredFields = ["firstName", "lastName", "licenseNumber"];
  const headerMap: Record<string, number> = {};

  headers.forEach((h, i) => {
    const normalized = h.toLowerCase().replace(/\s+/g, "");
    headerMap[normalized] = i;
  });

  for (const field of requiredFields) {
    const idx = headerMap[field.toLowerCase()];
    if (idx === undefined || !row[idx]) {
      errors.push(`Campo requerido faltante: ${field}`);
    }
  }

  return errors;
}

export function validateBusImportRow(row: any[], headers: string[]): string[] {
  const errors: string[] = [];
  const requiredFields = ["plateNumber", "brand", "model"];
  const headerMap: Record<string, number> = {};

  headers.forEach((h, i) => {
    const normalized = h.toLowerCase().replace(/\s+/g, "");
    headerMap[normalized] = i;
  });

  for (const field of requiredFields) {
    const idx = headerMap[field.toLowerCase()];
    if (idx === undefined || !row[idx]) {
      errors.push(`Campo requerido faltante: ${field}`);
    }
  }

  return errors;
}

export function validateTripImportRow(row: any[], headers: string[]): string[] {
  const errors: string[] = [];
  const requiredFields = ["routeCode", "scheduledDate", "departureTime"];
  const headerMap: Record<string, number> = {};

  headers.forEach((h, i) => {
    const normalized = h.toLowerCase().replace(/\s+/g, "");
    headerMap[normalized] = i;
  });

  for (const field of requiredFields) {
    const idx = headerMap[field.toLowerCase()];
    if (idx === undefined || !row[idx]) {
      errors.push(`Campo requerido faltante: ${field}`);
    }
  }

  return errors;
}
