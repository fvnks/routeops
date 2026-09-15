"use client";

import { signOut } from "next-auth/react";
import { NotificationBell } from "./notification-bell";
import { BorderStatusWidget } from "@/components/dashboard/border-status";

export default function Topbar({ user }: { user: any }) {
  return (
    <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <BorderStatusWidget compact />
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
