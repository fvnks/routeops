"use client";

interface Stop {
  name: string;
  km: number;
  order: number;
}

interface RouteStopsEditorProps {
  stops: Stop[];
  onChange: (stops: Stop[]) => void;
}

export function RouteStopsEditor({ stops, onChange }: RouteStopsEditorProps) {
  function addStop() {
    onChange([...stops, { name: "", km: 0, order: stops.length }]);
  }

  function updateStop(i: number, field: keyof Stop, value: string | number) {
    const next = [...stops];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  }

  function removeStop(i: number) {
    onChange(stops.filter((_, idx) => idx !== i));
  }

  function moveStop(i: number, direction: -1 | 1) {
    const j = i + direction;
    if (j < 0 || j >= stops.length) return;
    const next = [...stops];
    [next[i], next[j]] = [next[j], next[i]];
    next.forEach((s, idx) => (s.order = idx));
    onChange(next);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Paradas Intermedias</h2>
        <button
          type="button"
          onClick={addStop}
          className="text-sm text-slate-600 hover:text-slate-900 font-medium"
        >
          + Agregar parada
        </button>
      </div>

      {stops.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">Sin paradas intermedias configuradas</p>
      ) : (
        <div className="space-y-2">
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveStop(i, -1)}
                  disabled={i === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveStop(i, 1)}
                  disabled={i === stops.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <span className="text-xs text-gray-400 w-5 text-center">{i + 1}</span>

              <input
                value={stop.name}
                onChange={(e) => updateStop(i, "name", e.target.value)}
                placeholder="Nombre de la parada"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />

              <input
                type="number"
                value={stop.km}
                onChange={(e) => updateStop(i, "km", +e.target.value)}
                placeholder="Km"
                className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />

              <button
                type="button"
                onClick={() => removeStop(i)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
