import React, { useEffect, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface PuestosPoint {
  periodo: string;
  puestos: number;
}

export interface SipaPuestosProps {
  /** Valor actual (último trimestre). */
  total?: number;
  /** Evolución por trimestre. */
  serie?: PuestosPoint[];
}

/** Datos simulados para probar el componente. */
export const MOCK_SIPA_SERIE: PuestosPoint[] = [
  { periodo: '2023 T2', puestos: 2710 },
  { periodo: '2023 T3', puestos: 2755 },
  { periodo: '2023 T4', puestos: 2790 },
  { periodo: '2024 T1', puestos: 2738 },
  { periodo: '2024 T2', puestos: 2801 },
  { periodo: '2024 T3', puestos: 2867 },
  { periodo: '2024 T4', puestos: 2902 },
  { periodo: '2025 T1', puestos: 2943 },
];

/** Anima un número de 0 al valor objetivo (respeta prefers-reduced-motion). */
export function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target <= 0) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

/** Número grande con count-up + sparkline interactivo (azul). */
export const SipaPuestos: React.FC<SipaPuestosProps> = ({
  total = 2943,
  serie = MOCK_SIPA_SERIE,
}) => {
  const animated = useCountUp(total);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums"
          aria-label={`${total.toLocaleString('es-AR')} puestos`}
        >
          {animated.toLocaleString('es-AR')}
        </span>
        <span className="text-sm font-bold text-slate-600">puestos registrados</span>
      </div>

      {serie.length > 1 && (
        <div className="w-full max-w-md">
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={serie} margin={{ top: 6, right: 8, bottom: 6, left: 8 }}>
              <Tooltip
                cursor={{ stroke: '#93c5fd', strokeDasharray: '3 3' }}
                formatter={(value) => [`${Number(value).toLocaleString('es-AR')} puestos`, '']}
                labelFormatter={(label) => String(label)}
                separator=""
                contentStyle={{ borderRadius: 10, borderColor: '#bfdbfe', fontSize: 12, padding: '4px 8px' }}
              />
              <Line
                type="monotone"
                dataKey="puestos"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>{serie[0].periodo}</span>
            <span>Evolución trimestral</span>
            <span>{serie[serie.length - 1].periodo}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SipaPuestos;
