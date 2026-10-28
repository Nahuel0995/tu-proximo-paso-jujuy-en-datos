import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Info } from 'lucide-react';
import areasJson from '../../data/areas.json';
import { Area, AreaId } from '../types';
import { AreaMetrics, getAreaMetrics } from '../utils/areaMetrics';

interface AreaComparatorProps {
  areas?: Area[];
  /** Permite inyectar métricas (por ejemplo, mock data) en lugar de leer los JSON reales. */
  getMetrics?: (areaId: AreaId) => AreaMetrics;
  initialA?: AreaId;
  initialB?: AreaId;
}

/** Métricas simuladas para probar el comparador sin los JSON reales. */
export const MOCK_METRICS: Record<string, AreaMetrics> = {
  A01: {
    pbg: { millones: 120.4, pct: 1.9, anio: 2024 },
    empleo: { puestos: 1850, periodo: 'T1 2026' },
    eil: null,
    exclusiones: { eil: 'La EIL excluye por diseño las actividades primarias (agro y minería) en el Gran Jujuy.' },
  },
  A03: {
    pbg: { millones: 305.67, pct: 4.7, anio: 2024 },
    empleo: { puestos: 3130, periodo: 'T1 2026' },
    eil: { indice: 112.4, periodo: 'Dic 2024' },
    exclusiones: {},
  },
};
export const mockGetMetrics = (id: AreaId): AreaMetrics =>
  MOCK_METRICS[id] ?? { pbg: null, empleo: null, eil: null, exclusiones: { pbg: 'Sin datos simulados.', empleo: 'Sin datos simulados.', eil: 'Sin datos simulados.' } };

type Side = 'a' | 'b';
const THEME: Record<Side, { bar: string; text: string; chip: string }> = {
  a: { bar: 'bg-sky-500', text: 'text-sky-700', chip: 'bg-sky-50 text-sky-800 border-sky-200' },
  b: { bar: 'bg-indigo-500', text: 'text-indigo-700', chip: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
};

const nf = (n: number, d = 0) => n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

/** Alerta gris cuando una métrica no aplica a un área. */
const Exclusion: React.FC<{ motivo: string }> = ({ motivo }) => (
  <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
    <div>
      <div className="font-bold text-gray-700">Exclusión metodológica</div>
      <p className="mt-0.5 leading-relaxed">{motivo}</p>
    </div>
  </div>
);

interface MetricCellProps {
  side: Side;
  areaName: string;
  value: number | null;
  max: number;
  display: string;
  detail: string;
  motivo?: string;
}

const MetricCell: React.FC<MetricCellProps> = ({ side, areaName, value, max, display, detail, motivo }) => (
  <div className="space-y-2">
    <div className={`text-[11px] font-bold uppercase tracking-wide ${THEME[side].text}`}>{areaName}</div>
    {value === null ? (
      <Exclusion motivo={motivo || 'Sin datos disponibles en la fuente.'} />
    ) : (
      <>
        <div className="text-2xl font-black tabular-nums text-gray-900">{display}</div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${THEME[side].bar}`}
            style={{ width: `${max > 0 ? Math.max((value / max) * 100, 3) : 0}%` }}
          />
        </div>
        <div className="text-[11px] text-gray-500">{detail}</div>
      </>
    )}
  </div>
);

interface CompareCardProps {
  title: string;
  source: string;
  nameA: string;
  nameB: string;
  a: { value: number | null; display: string; detail: string; motivo?: string };
  b: { value: number | null; display: string; detail: string; motivo?: string };
  /** Redacta la diferencia: (mayor, menor, diferencia absoluta) -> texto. */
  diffText: (higher: string, lower: string, diff: number) => string;
}

const CompareCard: React.FC<CompareCardProps> = ({ title, source, nameA, nameB, a, b, diffText }) => {
  const max = Math.max(a.value ?? 0, b.value ?? 0);
  let banner: React.ReactNode;

  if (a.value !== null && b.value !== null) {
    const diff = Math.abs(a.value - b.value);
    banner =
      diff === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
          Ambas actividades registran el mismo valor.
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
          {a.value > b.value ? diffText(nameA, nameB, diff) : diffText(nameB, nameA, diff)}
        </div>
      );
  } else {
    banner = (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
        No se puede calcular la diferencia: al menos una actividad no tiene este dato en la fuente.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-black text-gray-900">{title}</h3>
        <span className="text-[11px] font-semibold text-gray-400">{source}</span>
      </header>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:divide-x md:divide-gray-100">
        <MetricCell side="a" areaName={nameA} max={max} {...a} />
        <div className="md:pl-5">
          <MetricCell side="b" areaName={nameB} max={max} {...b} />
        </div>
      </div>
      {banner}
    </section>
  );
};

/** Vista comparadora: dos áreas frente a frente con diferencias calculadas. */
export const AreaComparator: React.FC<AreaComparatorProps> = ({
  areas = areasJson as Area[],
  getMetrics = getAreaMetrics,
  initialA,
  initialB,
}) => {
  const [idA, setIdA] = useState<AreaId>(initialA ?? areas[0].area_id);
  const [idB, setIdB] = useState<AreaId>(initialB ?? (areas[2] ?? areas[1] ?? areas[0]).area_id);

  const areaA = areas.find((x) => x.area_id === idA)!;
  const areaB = areas.find((x) => x.area_id === idB)!;
  const mA = useMemo(() => getMetrics(idA), [getMetrics, idA]);
  const mB = useMemo(() => getMetrics(idB), [getMetrics, idB]);

  const renderSelect = (label: string, value: AreaId, onChange: (v: AreaId) => void, side: Side) => (
    <label className="block flex-1">
      <span className={`mb-1 block text-[11px] font-black uppercase tracking-wider ${THEME[side].text}`}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AreaId)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {areas.map((a) => (
          <option key={a.area_id} value={a.area_id}>
            {a.area_id} · {a.nombre}
          </option>
        ))}
      </select>
    </label>
  );

  const swap = () => {
    setIdA(idB);
    setIdB(idA);
  };

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Comparador de áreas</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Elegí dos actividades y contrastá su aporte al PBG y su empleo registrado, con los datos oficiales de cada fuente.
        </p>
      </div>

      {/* Selectores */}
      <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        {renderSelect('Área 1 (referencia)', idA, setIdA, 'a')}
        <button
          type="button"
          onClick={swap}
          aria-label="Intercambiar áreas"
          title="Intercambiar áreas"
          className="mx-auto flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-indigo-600 active:scale-95 sm:mx-0"
        >
          <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
        </button>
        {renderSelect('Área 2 (contraste)', idB, setIdB, 'b')}
      </div>

      {idA === idB && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          Elegiste la misma área en ambos lados. Probá con otra para ver diferencias.
        </div>
      )}

      <CompareCard
        title="Aporte económico (PBG)"
        source="DiPEC · precios constantes de 2004"
        nameA={areaA.nombre}
        nameB={areaB.nombre}
        a={{
          value: mA.pbg ? mA.pbg.millones : null,
          display: mA.pbg ? `$ ${nf(mA.pbg.millones, 2)} M` : '—',
          detail: mA.pbg ? `${nf(mA.pbg.pct, 1)}% del PBG provincial (${mA.pbg.anio}*)` : '',
          motivo: mA.exclusiones.pbg,
        }}
        b={{
          value: mB.pbg ? mB.pbg.millones : null,
          display: mB.pbg ? `$ ${nf(mB.pbg.millones, 2)} M` : '—',
          detail: mB.pbg ? `${nf(mB.pbg.pct, 1)}% del PBG provincial (${mB.pbg.anio}*)` : '',
          motivo: mB.exclusiones.pbg,
        }}
        diffText={(h, l, d) => `${h} aporta $ ${nf(d, 2)} millones más al PBG que ${l}.`}
      />

      <CompareCard
        title="Empleo registrado (OEDE / SIPA)"
        source="Puestos asalariados privados registrados"
        nameA={areaA.nombre}
        nameB={areaB.nombre}
        a={{
          value: mA.empleo ? mA.empleo.puestos : null,
          display: mA.empleo ? nf(mA.empleo.puestos) : '—',
          detail: mA.empleo ? `puestos de trabajo (${mA.empleo.periodo})` : '',
          motivo: mA.exclusiones.empleo,
        }}
        b={{
          value: mB.empleo ? mB.empleo.puestos : null,
          display: mB.empleo ? nf(mB.empleo.puestos) : '—',
          detail: mB.empleo ? `puestos de trabajo (${mB.empleo.periodo})` : '',
          motivo: mB.exclusiones.empleo,
        }}
        diffText={(h, l, d) => `${h} registra ${nf(d)} puestos más que ${l}.`}
      />

      <CompareCard
        title="Índice de empleo (EIL · Gran Jujuy)"
        source="MTEySS · empresas privadas urbanas"
        nameA={areaA.nombre}
        nameB={areaB.nombre}
        a={{
          value: mA.eil ? mA.eil.indice : null,
          display: mA.eil ? nf(mA.eil.indice, 1) : '—',
          detail: mA.eil ? `índice de empleo (${mA.eil.periodo})` : '',
          motivo: mA.exclusiones.eil,
        }}
        b={{
          value: mB.eil ? mB.eil.indice : null,
          display: mB.eil ? nf(mB.eil.indice, 1) : '—',
          detail: mB.eil ? `índice de empleo (${mB.eil.periodo})` : '',
          motivo: mB.exclusiones.eil,
        }}
        diffText={(h, l, d) => `${h} tiene un índice de empleo ${nf(d, 1)} puntos mayor que ${l}.`}
      />

      <p className="text-[11px] leading-relaxed text-gray-500">
        Comparación informativa, no un ranking ni una recomendación. Los datos con * son provisorios. Las fuentes miden
        universos distintos (PBG: toda la provincia; OEDE: empleo privado registrado; EIL: Gran Jujuy).
      </p>
    </div>
  );
};

export default AreaComparator;
