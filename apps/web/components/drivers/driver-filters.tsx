"use client";

import { SearchInput } from "@/components/shared/search-input";

interface DriverFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function DriverFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: DriverFiltersProps) {
  return (
    <div className="flex gap-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por nombre o licencia..."
        className="flex-1"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <option value="">Todos los estados</option>
        <option value="ACTIVE">Activo</option>
        <option value="INACTIVE">Inactivo</option>
        <option value="SUSPENDED">Suspendido</option>
      </select>
    </div>
  );
}
