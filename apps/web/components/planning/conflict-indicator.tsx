"use client";

interface ConflictIndicatorProps {
  conflicts: string[];
}

export function ConflictIndicator({ conflicts }: ConflictIndicatorProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span className="text-xs font-medium text-red-700">
        {conflicts.length} conflicto{conflicts.length > 1 ? "s" : ""}
      </span>
    </div>
  );
}
