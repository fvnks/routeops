import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const XLSX = require("xlsx");
    const workbook = XLSX.read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      return NextResponse.json({ error: "El archivo está vacío o no tiene datos" }, { status: 400 });
    }

    const headers = data[0] as string[];
    const rows = data.slice(1) as any[][];

    return NextResponse.json({ headers, rows });
  } catch (error) {
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}
