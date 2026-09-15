"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setLogo(data.logoBase64 || null);
        setCompanyName(data.companyName || null);
      })
      .catch(() => {});

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl bg-white/70 transition-opacity duration-200 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center">
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            className="mb-4 animate-pulse"
            style={{ width: 120, height: 120, objectFit: "contain" }}
          />
        ) : (
          <div className="w-[120px] h-[120px] rounded-2xl bg-slate-200/80 flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {companyName || "RouteOps"}
        </h1>
        <p className="text-gray-500 text-sm">Sistema de Gestión Operativa</p>

        <div className="mt-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
