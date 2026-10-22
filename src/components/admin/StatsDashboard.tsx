import React from 'react';
import { BarChartCard } from './BarChartCard';
import { DonutChartCard } from './DonutChartCard';
import { ChartDatum, MOCK_DASHBOARD_DATA } from './chartTypes';

export interface DashboardData {
  areasElegidas?: ChartDatum[] | null;
  areasConsultadas?: ChartDatum[] | null;
  motivos?: ChartDatum[] | null;
  tareas?: ChartDatum[] | null;
  edades?: ChartDatum[] | null;
}

interface StatsDashboardProps {
  /** Si no se pasa, se usan datos de ejemplo. */
  data?: DashboardData;
  /** Nombres legibles de áreas (id -> nombre) para el tooltip. */
  areaLabels?: Record<string, string>;
}

/** Contenedor general: grilla responsiva con los 5 gráficos. */
export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  data = MOCK_DASHBOARD_DATA,
  areaLabels,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <BarChartCard
      title="Áreas elegidas en el asistente"
      subtitle="Cantidad de veces que cada área fue seleccionada"
      data={data.areasElegidas}
      labels={areaLabels}
    />
    <BarChartCard
      title="Áreas más consultadas"
      subtitle="Fichas de área vistas"
      data={data.areasConsultadas}
      labels={areaLabels}
    />
    <DonutChartCard title="Motivo de exploración" data={data.motivos} />
    <DonutChartCard title="Tipo de tarea de interés" data={data.tareas} />
    <DonutChartCard title="Rango de edad" data={data.edades} />
  </div>
);

export default StatsDashboard;
