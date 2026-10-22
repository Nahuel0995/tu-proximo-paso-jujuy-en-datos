import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { BLUE_PALETTE, ChartDatum, sumValues } from './chartTypes';

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data?: ChartDatum[] | null;
  /** Nombres legibles opcionales (ej. A05 -> "Industria"). */
  labels?: Record<string, string>;
}

/** Barras horizontales: ideal para muchas categorías. */
export const BarChartCard: React.FC<BarChartCardProps> = ({ title, subtitle, data, labels }) => {
  const safe = data ?? [];
  const total = sumValues(safe);

  return (
    <ChartCard title={title} subtitle={subtitle} data={data}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={safe} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis
            type="category"
            dataKey="name"
            width={48}
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value) => {
              const v = Number(value);
              return [`${v} (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, 'Cantidad'];
            }}
            labelFormatter={(name) => {
              const key = String(name);
              return labels?.[key] ? `${key} · ${labels[key]}` : key;
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {safe.map((_, i) => (
              <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
