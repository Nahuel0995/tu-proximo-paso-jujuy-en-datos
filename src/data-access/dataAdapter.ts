import {
  AreaId,
  PBGDataset,
  OEDEDataset,
  EILDataset,
  MIPDataset,
} from '../types';
import pbgJson from '../../data/pbg.json';
import oedeJson from '../../data/empleo_oede.json';
import eilJson from '../../data/eil.json';
import mipJson from '../../data/mip_empleo.json';

const pbg = pbgJson as PBGDataset;
const oede = oedeJson as OEDEDataset;
const eil = eilJson as EILDataset;
const mip = mipJson as MIPDataset;

export interface AreaOverview {
  pbg: {
    anio: number | null;
    valorConstanteMiles: number | null;
    valorCorrienteMiles: number | null;
  };
  oede: {
    disponible: boolean;
    puestosTrabajo: number | null;
    ultimoPeriodo: string | null;
    /** true si alguna rama del último período está bajo secreto estadístico. */
    tieneSecretoEstadistico: boolean;
    /** false si el subtotal es parcial por secreto estadístico. */
    esCompleto: boolean;
    motivoNoDisponible: string | null;
  };
  eil: {
    disponible: boolean;
    motivoExclusion: string | null;
  };
  mip: {
    sectoresAsignados: number;
    multiplicadorTotalPromedio: number | null;
    empleoDirectoPromedio: number | null;
  };
}

export interface ProvincialOverview {
  anioPbg: number | null;
  pbgTotalConstanteMiles: number | null;
  pbgTotalCorrienteMiles: number | null;
  oedeUltimoPeriodo: string | null;
}

const MOTIVO_OEDE_A10 =
  'El OEDE releva solo empleo asalariado privado registrado en el SIPA; la serie de Jujuy no incluye la Rama L (administración pública). Esto no implica ausencia de empleo público.';
const MOTIVO_EIL_PRIMARIA =
  'La EIL excluye por diseño las actividades primarias (agro, ganadería, minería) en el aglomerado Gran Jujuy. No implica ausencia de actividad.';
const MOTIVO_EIL_PUBLICA =
  'La EIL investiga solo empresas del sector privado y no releva la administración pública.';

const avg = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

/** Resumen "último dato disponible" de un área, a partir de los JSON oficiales. */
export function getAreaOverview(areaId: AreaId): AreaOverview {
  // ---- PBG ----
  const pbgRecs = pbg.series.filter((r) => r.area_id === areaId);
  let anio: number | null = null;
  let valorConstanteMiles: number | null = null;
  let valorCorrienteMiles: number | null = null;
  if (pbgRecs.length > 0) {
    anio = Math.max(...pbgRecs.map((r) => r.periodo_anio));
    const latest = pbgRecs.filter((r) => r.periodo_anio === anio);
    valorConstanteMiles = latest.reduce((a, r) => a + (r.valor_constante || 0), 0);
    valorCorrienteMiles = latest.reduce((a, r) => a + (r.valor_corriente || 0), 0);
  }

  // ---- OEDE ----
  const letras = oede.series.filter(
    (r) => r.area_id === areaId && r.tipo_nivel === 'LETRA' && r.anio !== null && r.trimestre !== null
  );
  let oedeInfo: AreaOverview['oede'];
  if (letras.length === 0) {
    oedeInfo = {
      disponible: false,
      puestosTrabajo: null,
      ultimoPeriodo: null,
      tieneSecretoEstadistico: false,
      esCompleto: false,
      motivoNoDisponible: areaId === 'A10' ? MOTIVO_OEDE_A10 : 'Sin serie en OEDE para esta actividad.',
    };
  } else {
    const lastKey = Math.max(...letras.map((r) => r.anio! * 10 + r.trimestre!));
    const latest = letras.filter((r) => r.anio! * 10 + r.trimestre! === lastKey);
    const secreto = latest.some((r) => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO');
    const valid = latest.filter((r) => typeof r.puestos_trabajo === 'number');
    oedeInfo = {
      disponible: valid.length > 0,
      puestosTrabajo: valid.length > 0 ? valid.reduce((a, r) => a + (r.puestos_trabajo || 0), 0) : null,
      ultimoPeriodo: latest[0].periodo,
      tieneSecretoEstadistico: secreto,
      esCompleto: !secreto,
      motivoNoDisponible: valid.length > 0 ? null : 'Datos bajo secreto estadístico en el período más reciente.',
    };
  }

  // ---- EIL ----
  let eilInfo: AreaOverview['eil'];
  if (['A01', 'A02'].includes(areaId)) eilInfo = { disponible: false, motivoExclusion: MOTIVO_EIL_PRIMARIA };
  else if (areaId === 'A10') eilInfo = { disponible: false, motivoExclusion: MOTIVO_EIL_PUBLICA };
  else {
    const key = ['A06', 'A07'].includes(areaId) ? 'A06_A07_AGRUPADA' : areaId;
    const has = eil.tabla_3_9_2_evolucion_y_ramas.some((r) => r.area_id === key && typeof r.valor === 'number');
    eilInfo = has
      ? { disponible: true, motivoExclusion: null }
      : { disponible: false, motivoExclusion: 'Sin serie en la EIL para esta actividad.' };
  }

  // ---- MIP ----
  const sectores = mip.sectores.filter((s) => s.area_id === areaId);
  const mult = sectores
    .map((s) => s.multiplicador_total_por_millon)
    .filter((v): v is number => typeof v === 'number');
  const directo = sectores
    .map((s) => s.empleo_directo_por_millon)
    .filter((v): v is number => typeof v === 'number');

  return {
    pbg: { anio, valorConstanteMiles, valorCorrienteMiles },
    oede: oedeInfo,
    eil: eilInfo,
    mip: {
      sectoresAsignados: sectores.length,
      multiplicadorTotalPromedio: avg(mult),
      empleoDirectoPromedio: avg(directo),
    },
  };
}

/** Totales provinciales usados para calcular participaciones. */
export function getProvincialOverview(): ProvincialOverview {
  const totals = pbg.series.filter((r) => r.codigo_rama === 'TOTAL');
  const anio = totals.length ? Math.max(...totals.map((r) => r.periodo_anio)) : null;
  const t = totals.find((r) => r.periodo_anio === anio);

  const all = oede.series.filter((r) => r.anio !== null && r.trimestre !== null);
  const last = all.length ? all.reduce((m, r) => (r.anio! * 10 + r.trimestre! > m.anio! * 10 + m.trimestre! ? r : m)) : null;

  return {
    anioPbg: anio,
    pbgTotalConstanteMiles: t?.valor_constante ?? null,
    pbgTotalCorrienteMiles: t?.valor_corriente ?? null,
    oedeUltimoPeriodo: last ? last.periodo : null,
  };
}
