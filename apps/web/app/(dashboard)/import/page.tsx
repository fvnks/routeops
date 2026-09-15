"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); parseFile(f); }
  }

  async function parseFile(f: File) {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", f);
    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setPreview(data);
      else setError(data.error || "Error al parsear archivo");
    } catch { setError("Error al procesar archivo"); }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Importar desde Excel" subtitle="Carga un archivo Excel o CSV con datos de conductores, buses o viajes" />

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
        <div className="text-4xl mb-3">📥</div>
        <p className="text-gray-600 font-medium">{file ? file.name : "Arrastra un archivo o haz clic para seleccionar"}</p>
        <p className="text-sm text-gray-400 mt-1">Soporta .xlsx, .xls, .csv</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{error}</div>}
      {loading && <LoadingPage />}

      {preview && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Vista previa ({preview.rows.length} filas)</h2>
            <p className="text-sm text-gray-500 mt-1">Esta es una vista previa. La importación completa se implementará en una versión futura.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {preview.headers.map((h: string, i: number) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.rows.slice(0, 10).map((row: any[], i: number) => (
                  <tr key={i}>{row.map((cell: any, j: number) => <td key={j} className="px-3 py-2 text-sm text-gray-600">{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
