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

    // Start fade out after 1.5s
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Complete after fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center">
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            className="w-24 h-24 object-contain mb-4 animate-pulse"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        )}
        <h1 className="text-2xl font-bold text-white mb-1">
          {companyName || "RouteOps"}
        </h1>
        <p className="text-slate-400 text-sm">Sistema de Gestión Operativa</p>

        {/* Loading spinner */}
        <div className="mt-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
