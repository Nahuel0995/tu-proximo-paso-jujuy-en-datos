import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ChartDatum } from './chartTypes';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data?: ChartDatum[] | null;
  children: React.ReactNode;
}

/** Tarjeta contenedora con estado vacío ("Sin datos todavía"). */
export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, data, children }) => {
  const isEmpty = !data || data.length === 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      <div className="mt-4">
        {isEmpty ? (
          <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-gray-500">
            <BarChart3 className="w-8 h-8 text-gray-300" aria-hidden="true" />
            <span className="text-sm">Sin datos todavía</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
