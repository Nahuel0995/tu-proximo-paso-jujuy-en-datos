import React, { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TimePoint {
  anio: number;
  valor: number;
}

export interface TimeEvolutionData {
  pbg: TimePoint[];
  empleo: TimePoint[];
}

interface TimeEvolutionChartProps {
  data?: TimeEvolutionData;
  /** Nombre de la actividad (para el título accesible). */
  areaLabel?: string;
}

type MetricKey = 'pbg' | 'empleo';

const METRICS: Record<
  MetricKey,
  { label: string; color: string; unit: string; format: (n: number) => string; axis: (n: number) => string }
> = {
  pbg: {
    label: 'PBG · Producción',
    color: '#10b981',
    unit: 'Millones de pesos (sin inflación, base 2004)',
    format: (n) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} millones`,
    axis: (n) => n.toLocaleString('es-AR', { maximumFractionDigits: 0 }),
  },
  empleo: {
    label: 'OEDE · Empleo privado',
    color: '#2563eb',
    unit: 'Puestos privados registrados (promedio anual)',
    format: (n) => `${n.toLocaleString('es-AR')} puestos`,
    axis: (n) => n.toLocaleString('es-AR', { notation: 'compact' }),
  },
};

/** Datos simulados para probar el componente. */
export const MOCK_TIME_EVOLUTION: TimeEvolutionData = {
  pbg: Array.from({ length: 21 }, (_, i) => ({
    anio: 2004 + i,
    valor: Math.round((180 + i * 6 + Math.sin(i / 2) * 18) * 100) / 100,
  })),
  empleo: Array.from({ length: 21 }, (_, i) => ({
    anio: 2004 + i,
    valor: Math.round(2100 + i * 45 + Math.cos(i / 3) * 90),
  })),
};

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: readonly any[];
  label?: string | number;
  metric: MetricKey;
}> = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;
  const m = METRICS[metric];
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <div className="font-bold text-gray-900">Año {label}</div>
      <div className="mt-0.5 font-semibold" style={{ color: m.color }}>
        {m.format(Number(payload[0].value))}
      </div>
    </div>
  );
};

/** Gráfico de evolución temporal con toggle PBG / Empleo (escalas distintas, una a la vez). */
export const TimeEvolutionChart: React.FC<TimeEvolutionChartProps> = ({
  data = MOCK_TIME_EVOLUTION,
  areaLabel,
}) => {
  const [metric, setMetric] = useState<MetricKey>(data.pbg.length > 0 ? 'pbg' : 'empleo');
  const m = METRICS[metric];
  const series = data[metric];
  const gradId = `grad-${metric}`;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Seleccionar métrica" className="inline-flex rounded-xl bg-gray-100 p-1">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => {
            const active = metric === key;
            const disabled = data[key].length === 0;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => setMetric(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {METRICS[key].label}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-gray-500">{m.unit}</span>
      </div>

      {series.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-sm text-gray-500">
          Sin datos para esta métrica{areaLabel ? ` en ${areaLabel}` : ''}.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="anio" tick={{ fontSize: 11, fill: '#6b7280' }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={m.axis} width={52} />
            <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ stroke: m.color, strokeDasharray: '3 3' }} />
            <Area
              key={metric}
              type="monotone"
              dataKey="valor"
              stroke={m.color}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TimeEvolutionChart;
