"use client";

import { useState } from "react";

interface PlanningToolbarProps {
  fromDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
}

export function PlanningToolbar({ fromDate, onDateChange, onRefresh }: PlanningToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Semana desde</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>
      <button
        onClick={onRefresh}
        className="mt-5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        Actualizar
      </button>
    </div>
  );
}
