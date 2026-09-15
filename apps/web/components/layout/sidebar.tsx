"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Settings {
  companyName: string | null;
  logoBase64: string | null;
  logoSize: number | null;
}

const navigation = [
  { name: "Panel Principal", href: "/", icon: "📊" },
  { name: "Buses", href: "/buses", icon: "🚌" },
  { name: "Conductores", href: "/drivers", icon: "👤" },
  { name: "Rutas", href: "/routes", icon: "🗺️" },
  { name: "Viajes", href: "/trips", icon: "🗓️" },
  { name: "Planificación", href: "/planning", icon: "📋" },
  { name: "Contingencias", href: "/contingencies", icon: "🚨" },
  { name: "Extraboard", href: "/extraboard", icon: "👥" },
  { name: "Importar", href: "/import", icon: "📥" },
  { name: "Reportes", href: "/reports", icon: "📊" },
  { name: "Auditoría", href: "/audit", icon: "📝" },
  { name: "Configuración", href: "/settings", icon: "⚙️" },
];

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings>({ companyName: null, logoBase64: null, logoSize: 40 });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const logoSize = settings.logoSize || 40;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:block">
      <div className="flex h-full flex-col">
        {/* Logo / Brand */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          {settings.logoBase64 ? (
            <div className="flex items-center gap-3">
              <img
                src={settings.logoBase64}
                alt="Logo"
                className="object-contain rounded"
                style={{ width: logoSize, height: logoSize }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {settings.companyName || "RouteOps"}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-xl font-bold text-slate-900">RouteOps</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
