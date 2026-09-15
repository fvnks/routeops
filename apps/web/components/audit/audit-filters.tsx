"use client";

interface AuditFiltersProps {
  entityFilter: string;
  onEntityFilterChange: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
}

export function AuditFilters({
  entityFilter,
  onEntityFilterChange,
  actionFilter,
  onActionFilterChange,
}: AuditFiltersProps) {
  return (
    <div className="flex gap-4">
      <select
        value={entityFilter}
        onChange={(e) => onEntityFilterChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <option value="">Todas las entidades</option>
        <option value="driver">Conductores</option>
        <option value="bus">Buses</option>
        <option value="route">Rutas</option>
        <option value="trip">Viajes</option>
        <option value="assignment">Asignaciones</option>
      </select>

      <select
        value={actionFilter}
        onChange={(e) => onActionFilterChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <option value="">Todas las acciones</option>
        <option value="CREATE">Crear</option>
        <option value="UPDATE">Actualizar</option>
        <option value="DELETE">Eliminar</option>
        <option value="ASSIGN">Asignar</option>
        <option value="STATUS_CHANGE">Cambio de estado</option>
      </select>
    </div>
  );
}
