"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";

type ImportType = "drivers" | "buses" | "trips";

interface ImportResult {
  success: number;
  errors: string[];
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>("drivers");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
      setResult(null);
      parseFile(f);
    }
  }

  async function parseFile(f: File) {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", f);
    formData.append("type", importType);
    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setPreview(data);
      else setError(data.error || "Error al parsear archivo");
    } catch {
      setError("Error al procesar archivo");
    }
    setLoading(false);
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    setError("");
    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: importType,
          headers: preview.headers,
          rows: preview.rows,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setPreview(null);
        setFile(null);
      } else {
        setError(data.error || "Error al importar");
      }
    } catch {
      setError("Error al procesar importación");
    }
    setImporting(false);
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const typeLabels: Record<ImportType, { label: string; fields: string }> = {
    drivers: {
      label: "Conductores",
      fields: "firstName*, lastName*, licenseNumber*, email, phone, baseLocation",
    },
    buses: {
      label: "Buses",
      fields: "plateNumber*, brand*, model*, year, capacity, busType",
    },
    trips: {
      label: "Viajes",
      fields: "routeCode*, scheduledDate*, departureTime*, tripType, notes",
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Importar desde Excel"
        subtitle="Carga un archivo Excel con datos de conductores, buses o viajes"
      />

      {/* Type selector */}
      <div className="flex gap-4">
        {(["drivers", "buses", "trips"] as ImportType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setImportType(type);
              handleReset();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              importType === type
                ? "bg-slate-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {typeLabels[type].label}
          </button>
        ))}
      </div>

      {/* Expected format */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Formato esperado</h3>
        <p className="text-xs text-blue-700">
          Campos con * son requeridos. Columnas: {typeLabels[importType].fields}
        </p>
      </div>

      {/* Upload zone */}
      {!result && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-4xl mb-3">📥</div>
          <p className="text-gray-600 font-medium">
            {file ? file.name : "Arrastra un archivo o haz clic para seleccionar"}
          </p>
          <p className="text-sm text-gray-400 mt-1">Soporta .xlsx, .xls, .csv</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
          {error}
        </div>
      )}

      {loading && <LoadingPage />}

      {/* Success result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✅</span>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Importación completada</h3>
              <p className="text-sm text-green-700">
                {result.success} registros importados exitosamente
              </p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-orange-800 mb-2">Errores:</p>
              <ul className="text-xs text-orange-700 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md hover:bg-green-200"
          >
            Importar otro archivo
          </button>
        </div>
      )}

      {/* Preview table */}
      {preview && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Vista previa ({preview.rows.length} filas)
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Revisa los datos antes de importar
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {importing ? "Importando..." : `Importar ${preview.rows.length} filas`}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {preview.headers.map((h: string, i: number) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.rows.map((row: any[], i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell: any, j: number) => (
                      <td key={j} className="px-3 py-2 text-sm text-gray-600">
                        {cell ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
