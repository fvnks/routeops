"use client";

import { useEffect, useState } from "react";

interface Settings {
  companyName: string | null;
  logoBase64: string | null;
}

export function RouteLoader() {
  const [settings, setSettings] = useState<Settings>({ companyName: null, logoBase64: null });
  const [show, setShow] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});

    const timer = setTimeout(() => {
      setShow(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 animate-fadeOut">
      <div className="flex flex-col items-center">
        {settings.logoBase64 ? (
          <img
            src={settings.logoBase64}
            alt="Logo"
            className="w-20 h-20 object-contain mb-4 animate-pulse rounded-xl"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        )}
        <h1 className="text-xl font-bold text-white">
          {settings.companyName || "RouteOps"}
        </h1>
        <div className="mt-6">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
