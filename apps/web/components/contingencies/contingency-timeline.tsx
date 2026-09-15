"use client";

interface TimelineEvent {
  id: string;
  action: string;
  performedBy: string | null;
  notes: string | null;
  createdAt: string;
}

interface ContingencyTimelineProps {
  events: TimelineEvent[];
}

const actionLabels: Record<string, string> = {
  REPORTED: "Reportada",
  NOTIFIED: "Notificado",
  REASSIGNED: "Reasignada",
  CANCELLED: "Cancelada",
  RESOLVED: "Resuelta",
  ESCALATED: "Escalada",
};

const actionColors: Record<string, string> = {
  REPORTED: "bg-red-100 text-red-800",
  NOTIFIED: "bg-blue-100 text-blue-800",
  REASSIGNED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  RESOLVED: "bg-green-100 text-green-800",
  ESCALATED: "bg-orange-100 text-orange-800",
};

export function ContingencyTimeline({ events }: ContingencyTimelineProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial</h3>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">Sin eventos registrados</p>
      ) : (
        <div className="space-y-4">
          {events.map((event, i) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    actionColors[event.action] || "bg-gray-100"
                  }`}
                />
                {i < events.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      actionColors[event.action] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {actionLabels[event.action] || event.action}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleString("es-CL")}
                  </span>
                </div>
                {event.performedBy && (
                  <p className="text-xs text-gray-500 mt-1">por {event.performedBy}</p>
                )}
                {event.notes && (
                  <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
