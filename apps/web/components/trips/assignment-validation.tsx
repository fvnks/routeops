import type { ValidationResult } from "@/types";

interface AssignmentValidationProps {
  result: ValidationResult;
}

export function AssignmentValidation({ result }: AssignmentValidationProps) {
  if (result.valid && result.warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {!result.valid && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm font-medium text-red-800 mb-1">Errores:</p>
          <ul className="text-xs text-red-700 space-y-1">
            {result.errors.map((err, i) => (
              <li key={i}>• <span className="font-medium">{err.field}:</span> {err.message}</li>
            ))}
          </ul>
        </div>
      )}
      {result.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm font-medium text-yellow-800 mb-1">Advertencias:</p>
          <ul className="text-xs text-yellow-700 space-y-1">
            {result.warnings.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
