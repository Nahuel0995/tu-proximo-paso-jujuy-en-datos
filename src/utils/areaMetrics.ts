import { AreaId, PBGDataset, OEDEDataset, EILDataset } from '../types';
import pbgJson from '../../data/pbg.json';
import oedeJson from '../../data/empleo_oede.json';
import eilJson from '../../data/eil.json';

export interface YearPoint {
  anio: number;
  valor: number;
}

export interface AreaMetrics {
  pbg: { millones: number; pct: number; anio: number } | null;
  empleo: { puestos: number; periodo: string } | null;
  eil: { indice: number; periodo: string } | null;
  /** Motivos de exclusión metodológica por métrica. */
  exclusiones: { pbg?: string; empleo?: string; eil?: string };
}

const EXCL_OEDE =
  'El OEDE releva solo empleo privado registrado (SIPA). Esta actividad no está incluida en la serie para Jujuy.';
const EXCL_EIL_PRIMARIA =
  'La EIL excluye por diseño las actividades primarias (agro y minería) en el Gran Jujuy.';
const EXCL_EIL_PUBLICA = 'La EIL solo investiga empresas privadas: no releva la administración pública.';

/** Serie anual del PBG a precios constantes de 2004, en millones de pesos. */
export function getPbgSeries(areaId: AreaId, pbg: PBGDataset = pbgJson as PBGDataset): YearPoint[] {
  const byYear = new Map<number, number>();
  pbg.series
    .filter((r) => r.area_id === areaId && typeof r.valor_constante === 'number')
    .forEach((r) => byYear.set(r.periodo_anio, (byYear.get(r.periodo_anio) || 0) + (r.valor_constante as number)));
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([anio, v]) => ({ anio, valor: v / 1000 }));
}

/** Serie anual de puestos de trabajo registrados (promedio de los trimestres disponibles). */
export function getEmpleoSeries(areaId: AreaId, oede: OEDEDataset = oedeJson as OEDEDataset): YearPoint[] {
  const quarterly = new Map<string, number>(); // "anio|trim" -> suma
  oede.series
    .filter(
      (r) =>
        r.area_id === areaId &&
        r.tipo_nivel === 'LETRA' &&
        typeof r.puestos_trabajo === 'number' &&
        r.anio !== null &&
        r.trimestre !== null
    )
    .forEach((r) => {
      const k = `${r.anio}|${r.trimestre}`;
      quarterly.set(k, (quarterly.get(k) || 0) + (r.puestos_trabajo as number));
    });
  const years = new Map<number, number[]>();
  quarterly.forEach((sum, k) => {
    const anio = Number(k.split('|')[0]);
    years.set(anio, [...(years.get(anio) || []), sum]);
  });
  return [...years.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([anio, xs]) => ({ anio, valor: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) }));
}

/** Métricas "último dato" de un área, con sus exclusiones metodológicas. */
export function getAreaMetrics(
  areaId: AreaId,
  pbg: PBGDataset = pbgJson as PBGDataset,
  oede: OEDEDataset = oedeJson as OEDEDataset,
  eil: EILDataset = eilJson as EILDataset
): AreaMetrics {
  const exclusiones: AreaMetrics['exclusiones'] = {};

  // PBG
  const recs = pbg.series.filter((r) => r.area_id === areaId);
  let pbgM: AreaMetrics['pbg'] = null;
  if (recs.length > 0) {
    const anio = Math.max(...recs.map((r) => r.periodo_anio));
    const millones =
      recs.filter((r) => r.periodo_anio === anio).reduce((a, r) => a + (r.valor_constante || 0), 0) / 1000;
    const totalProv =
      (pbg.series.find((r) => r.codigo_rama === 'TOTAL' && r.periodo_anio === anio)?.valor_constante || 0) / 1000;
    pbgM = { millones, pct: totalProv > 0 ? (millones / totalProv) * 100 : 0, anio };
  } else {
    exclusiones.pbg = 'Sin datos de PBG para esta actividad.';
  }

  // Empleo (OEDE)
  const serie = oede.series.filter((r) => r.area_id === areaId && r.tipo_nivel === 'LETRA');
  let empleoM: AreaMetrics['empleo'] = null;
  const periods = serie
    .filter((r) => typeof r.puestos_trabajo === 'number' && r.anio !== null && r.trimestre !== null)
    .map((r) => r.anio! * 10 + r.trimestre!);
  if (periods.length > 0) {
    const last = Math.max(...periods);
    const puestos = serie
      .filter((r) => r.anio! * 10 + r.trimestre! === last)
      .reduce((a, r) => a + (r.puestos_trabajo || 0), 0);
    empleoM = { puestos, periodo: `T${last % 10} ${Math.floor(last / 10)}` };
  } else {
    exclusiones.empleo = EXCL_OEDE;
  }

  // EIL (índice de empleo)
  let eilM: AreaMetrics['eil'] = null;
  if (['A01', 'A02'].includes(areaId)) exclusiones.eil = EXCL_EIL_PRIMARIA;
  else if (areaId === 'A10') exclusiones.eil = EXCL_EIL_PUBLICA;
  else {
    const key = ['A06', 'A07'].includes(areaId) ? 'A06_A07_AGRUPADA' : areaId;
    const idx = eil.tabla_3_9_2_evolucion_y_ramas.filter(
      (r) => r.area_id === key && r.bloque === 'INDICE_POR_RAMA' && typeof r.valor === 'number'
    );
    if (idx.length > 0) {
      const last = idx[idx.length - 1];
      eilM = { indice: last.valor as number, periodo: last.periodo };
    } else exclusiones.eil = 'Sin datos de la EIL para esta actividad.';
  }

  return { pbg: pbgM, empleo: empleoM, eil: eilM, exclusiones };
}
