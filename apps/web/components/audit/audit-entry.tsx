import { formatDateTime } from "@/lib/utils";

interface AuditColumnsProps {
  log: {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    description: string | null;
    createdAt: string;
    user: { firstName: string; lastName: string } | null;
  };
}

export function AuditLogEntry({ log }: AuditColumnsProps) {
  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    ASSIGN: "bg-purple-100 text-purple-800",
    STATUS_CHANGE: "bg-yellow-100 text-yellow-800",
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || "bg-gray-100 text-gray-800"}`}>
          {log.action}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.entityType}</td>
      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.entityId.slice(0, 8)}...</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {log.user ? `${log.user.firstName} ${log.user.lastName}` : "—"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{log.description || "—"}</td>
    </tr>
  );
}
