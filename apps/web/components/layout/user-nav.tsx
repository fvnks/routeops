"use client";

import { useSession, signOut } from "next-auth/react";

export function UserNav() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-3">
      {session?.user && (
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{session.user.name || session.user.email}</p>
          <p className="text-xs text-gray-500">{(session.user as any).role || "usuario"}</p>
        </div>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Salir
      </button>
    </div>
  );
}
