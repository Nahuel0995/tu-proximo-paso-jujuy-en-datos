import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface PbgGaugeProps {
  /** Valor de la actividad, en millones de pesos (ej. 305.67). */
  areaValueMillones?: number;
  /** PBG provincial total, en millones de pesos. */
  totalValueMillones?: number;
  /** Nombre de la actividad para el tooltip. */
  areaLabel?: string;
}

const fmtMoney = (n: number) =>
  `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} millones`;

/**
 * Gauge semicircular (donut fino de 180°) que muestra el aporte de la actividad
 * frente al resto del PBG provincial. Anima al cargar y el tooltip muestra montos reales.
 * Los valores por defecto son datos simulados (4,7 % ≈ $ 305,67 millones).
 */
export const PbgGauge: React.FC<PbgGaugeProps> = ({
  areaValueMillones = 305.67,
  totalValueMillones = 6503.6,
  areaLabel = 'Esta actividad',
}) => {
  const total = totalValueMillones > 0 ? totalValueMillones : 1;
  const area = Math.min(Math.max(areaValueMillones, 0), total);
  const rest = total - area;
  const pct = (area / total) * 100;

  const data = [
    { name: areaLabel, value: area, color: '#10b981' }, // emerald-500
    { name: 'Resto de la economía provincial', value: rest, color: '#d1fae5' }, // emerald-100
  ];

  return (
    <div className="relative w-full max-w-xs" role="img" aria-label={`Aporte de ${pct.toFixed(1)}% al PBG provincial`}>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="88%"
            innerRadius="72%"
            outerRadius="100%"
            cornerRadius={8}
            paddingAngle={1}
            stroke="none"
            isAnimationActive
            animationBegin={150}
            animationDuration={1100}
            animationEasing="ease-out"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              return [`${fmtMoney(v)} (${((v / total) * 100).toFixed(1)}%)`, String(name)];
            }}
            contentStyle={{ borderRadius: 12, borderColor: '#a7f3d0', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Texto central */}
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-2xl font-black text-emerald-700 leading-none">{pct.toFixed(1)}%</span>
        <span className="text-[10px] font-semibold text-slate-500 mt-0.5">del PBG provincial</span>
      </div>
    </div>
  );
};

export default PbgGauge;
