"use client";

import { TIME_SLOTS } from "@/lib/constants";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TimeInput({
  value,
  onChange,
  label,
  id,
  error,
  required,
  disabled,
}: TimeInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 opacity-60" : ""}`}
      >
        <option value="">Seleccionar hora</option>
        {TIME_SLOTS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
