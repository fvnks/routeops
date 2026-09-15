"use client";

import { SearchInput } from "@/components/shared/search-input";

interface BusFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function BusFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: BusFiltersProps) {
  return (
    <div className="flex gap-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por patente, código o modelo..."
        className="flex-1"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <option value="">Todos los estados</option>
        <option value="AVAILABLE">Disponible</option>
        <option value="IN_MAINTENANCE">Mantenimiento</option>
        <option value="RETIRED">Retirado</option>
        <option value="RESERVED">Reservado</option>
      </select>
    </div>
  );
}
