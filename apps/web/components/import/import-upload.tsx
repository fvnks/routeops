"use client";

import { useState, useCallback } from "react";

interface ImportUploadProps {
  type: "drivers" | "buses" | "trips";
  onPreview: (data: { headers: string[]; rows: any[][]; errors: string[] }) => void;
}

export function ImportUpload({ type, onPreview }: ImportUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al procesar archivo");
      } else {
        onPreview(data);
      }
    } catch {
      setError("Error de conexión");
    }
    setLoading(false);
  }, [type, onPreview]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Importar {type}</h2>
      <p className="text-sm text-gray-500 mb-4">Selecciona un archivo Excel (.xlsx, .xls) para importar datos.</p>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <span className="text-sm text-gray-500">
          {loading ? "Procesando..." : "Arrastra o haz clic para seleccionar"}
        </span>
        <input type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
