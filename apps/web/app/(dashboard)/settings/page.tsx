"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";

interface Settings {
  id: string;
  companyName: string | null;
  logoBase64: string | null;
  logoSize: number | null;
  faviconUrl: string | null;
  primaryColor: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [logoSize, setLogoSize] = useState(40);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      setCompanyName(data.companyName || "");
      setPrimaryColor(data.primaryColor || "#0f172a");
      setLogoSize(data.logoSize || 40);
      setLogoPreview(data.logoBase64 || null);
    } catch (error) {
      console.error("Error al cargar settings:", error);
    }
    setLoading(false);
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("El logo debe ser menor a 2MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    setSaving(true);
    try {
      let logoBase64 = logoPreview;
      if (logoFile) {
        logoBase64 = logoPreview;
      }

      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName || null,
          logoBase64: logoBase64 || null,
          logoSize,
          primaryColor,
        }),
      });

      window.location.reload();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
    setSaving(false);
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Personaliza la apariencia de la aplicación"
      />

      {/* Logo Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Logo de la Empresa</h3>

        <div className="flex items-start gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            <div
              className="rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50"
              style={{ width: logoSize + 32, height: logoSize + 32 }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="object-contain"
                  style={{ width: logoSize, height: logoSize }}
                />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500 mt-1">Sin logo</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoSelect}
              className="hidden"
            />
            <div className="space-y-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Seleccionar imagen
              </button>
              {logoPreview && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Quitar logo
                </button>
              )}
              <p className="text-xs text-gray-500">
                PNG, JPG o SVG. Máximo 2MB. Se recomienda fondo transparente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Size */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Tamaño del Logo (Sidebar)</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="24"
            max="80"
            value={logoSize}
            onChange={(e) => setLogoSize(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12 text-right">{logoSize}px</span>
        </div>
        <div className="mt-3 flex gap-4">
          <button
            onClick={() => setLogoSize(24)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Pequeño (24px)
          </button>
          <button
            onClick={() => setLogoSize(40)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Mediano (40px)
          </button>
          <button
            onClick={() => setLogoSize(64)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Grande (64px)
          </button>
          <button
            onClick={() => setLogoSize(80)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Extra Grande (80px)
          </button>
        </div>
      </div>

      {/* Company Name */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Nombre de la Empresa</h3>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Ej: Transportes Los Andes"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Primary Color */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Color Principal</h3>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
