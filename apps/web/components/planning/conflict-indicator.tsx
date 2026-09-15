import { formatTime } from "@/lib/utils";

interface ConflictIndicatorProps {
  conflicts: string[];
}

export function ConflictIndicator({ conflicts }: ConflictIndicatorProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3">
      <p className="text-sm font-medium text-red-800 mb-1">Conflictos detectados:</p>
      <ul className="text-xs text-red-700 space-y-1">
        {conflicts.map((c, i) => <li key={i}>• {c}</li>)}
      </ul>
    </div>
  );
}
