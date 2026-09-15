"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ExtraboardPanel } from "@/components/extraboard/extraboard-panel";

export default function ExtraboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Extraboard"
        subtitle="Gestión de conductores de respaldo para contingencias"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExtraboardPanel />

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Qué es el Extraboard?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              El <strong>extraboard</strong> es un grupo de conductores designados para cubrir
              ausencias inesperadas y emergencias operacionales.
            </p>
            <p>
              Estos conductores no tienen viajes fijos asignados y están disponibles para
              reasignarse cuando un conductor regular no puede cumplir su turno.
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
              <p className="text-blue-800 font-medium">Beneficios:</p>
              <ul className="text-blue-700 mt-2 space-y-1">
                <li>• Cubre ausencias por enfermedad o emergencia</li>
                <li>• Reduce cancelaciones de viajes</li>
                <li>• Mejora la confiabilidad del servicio</li>
                <li>• Optimiza el uso de la fuerza laboral</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
