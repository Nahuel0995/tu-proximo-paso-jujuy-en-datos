import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { BLUE_PALETTE, ChartDatum, sumValues } from './chartTypes';

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data?: ChartDatum[] | null;
}

/** Dona: ideal para proporciones de un total. */
export const DonutChartCard: React.FC<DonutChartCardProps> = ({ title, subtitle, data }) => {
  const safe = data ?? [];
  const total = sumValues(safe);

  return (
    <ChartCard title={title} subtitle={subtitle} data={data}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={safe}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="#ffffff"
          >
            {safe.map((_, i) => (
              <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              return [`${v} (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, String(name)];
            }}
          />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
