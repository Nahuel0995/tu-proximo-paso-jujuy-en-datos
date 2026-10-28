import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface MipStackedBarProps {
  /** Puestos directos por cada $1M de producción. */
  directo?: number;
  /** Puestos indirectos (en proveedores) por cada $1M de producción. */
  indirecto?: number;
  /** Total publicado por la MIP (puede diferir levemente de la suma por redondeo). */
  total?: number;
}

const COLORS = { directo: '#4f46e5', indirecto: '#a5b4fc' }; // indigo-600 / indigo-300

const EXPLICACIONES: Record<string, { titulo: string; texto: string }> = {
  directo: {
    titulo: 'Empleo directo',
    texto: 'Puestos que genera la propia actividad por cada $1M de producción (VBP).',
  },
  indirecto: {
    titulo: 'Empleo indirecto',
    texto: 'Puestos que se generan en los proveedores de insumos de la actividad por cada $1M de producción.',
  },
};

const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip: React.FC<{ active?: boolean; payload?: readonly any[] }> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const info = EXPLICACIONES[String(item.dataKey)];
  if (!info) return null;
  return (
    <div className="max-w-[240px] rounded-xl border border-indigo-200 bg-white p-3 shadow-md text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-900">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
        {info.titulo}: {fmt(Number(item.value))}
      </div>
      <p className="mt-1 text-slate-600 leading-relaxed">{info.texto}</p>
    </div>
  );
};

/**
 * Barra horizontal apilada: Total = Directo + Indirecto.
 * Datos por defecto simulados (0,73 + 0,12 ≈ 0,86).
 */
export const MipStackedBar: React.FC<MipStackedBarProps> = ({
  directo = 0.73,
  indirecto = 0.12,
  total = 0.86,
}) => {
  const data = [{ name: 'Empleo total', directo, indirecto }];

  return (
    <div className="space-y-3 w-full max-w-xl">
      {/* Ecuación visual */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.directo }} />
          Directo {fmt(directo)}
        </span>
        <span className="text-slate-400">+</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.indirecto }} />
          Indirecto {fmt(indirecto)}
        </span>
        <span className="text-slate-400">=</span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
          Total {fmt(total)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={84}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis type="number" hide domain={[0, Math.max(total, directo + indirecto) * 1.02]} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip cursor={{ fill: 'rgba(99,102,241,0.08)' }} content={<CustomTooltip />} />
          <Bar
            dataKey="directo"
            stackId="empleo"
            fill={COLORS.directo}
            radius={[10, 0, 0, 10]}
            barSize={34}
            animationDuration={900}
          />
          <Bar
            dataKey="indirecto"
            stackId="empleo"
            fill={COLORS.indirecto}
            radius={[0, 10, 10, 0]}
            barSize={34}
            animationDuration={900}
            animationBegin={400}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-slate-500 leading-relaxed">
        Puestos por cada $1M de producción. Pasá el cursor sobre cada tramo para ver qué significa.
        El total publicado por la MIP puede diferir levemente de la suma por redondeo.
      </p>
    </div>
  );
};

export default MipStackedBar;
