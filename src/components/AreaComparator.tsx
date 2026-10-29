import React, { useState } from 'react';
import { Area, AreaId } from '../types';
import { getAreaOverview, getProvincialOverview } from '../data-access/dataAdapter';
import { formatNumber } from '../utils/formatters';
import { AreaIcon } from '../utils/iconHelper';
import {
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Users,
  Network,
  Building2,
  ExternalLink,
  Scale,
  Sparkles,
} from 'lucide-react';

interface AreaComparatorProps {
  areas: Area[];
  initialArea1Id?: AreaId;
  initialArea2Id?: AreaId;
  onSelectArea?: (areaId: AreaId) => void;
}

export const AreaComparator: React.FC<AreaComparatorProps> = ({
  areas,
  initialArea1Id = 'A01',
  initialArea2Id = 'A03',
  onSelectArea,
}) => {
  const [area1Id, setArea1Id] = useState<AreaId>(initialArea1Id);
  const [area2Id, setArea2Id] = useState<AreaId>(initialArea2Id);
  const [pbgPriceMode, setPbgPriceMode] = useState<'constante' | 'corriente'>('constante');

  const area1 = areas.find((a) => a.area_id === area1Id) || areas[0];
  const area2 = areas.find((a) => a.area_id === area2Id) || areas[1];

  const ov1 = getAreaOverview(area1Id);
  const ov2 = getAreaOverview(area2Id);

  const handleSwap = () => {
    setArea1Id(area2Id);
    setArea2Id(area1Id);
  };

  const setPreset = (a1: AreaId, a2: AreaId) => {
    setArea1Id(a1);
    setArea2Id(a2);
  };

  const provincial = getProvincialOverview();

  // 1. PBG
  const isConstante = pbgPriceMode === 'constante';
  const totalProvPbg = isConstante
    ? provincial.pbgTotalConstanteMiles
    : provincial.pbgTotalCorrienteMiles;

  const pbg1Val = isConstante ? ov1?.pbg.valorConstanteMiles : ov1?.pbg.valorCorrienteMiles;
  const pbg2Val = isConstante ? ov2?.pbg.valorConstanteMiles : ov2?.pbg.valorCorrienteMiles;

  const pbg1Pct =
    pbg1Val !== null && pbg1Val !== undefined && totalProvPbg !== null && totalProvPbg > 0
      ? Number(((pbg1Val / totalProvPbg) * 100).toFixed(2))
      : null;

  const pbg2Pct =
    pbg2Val !== null && pbg2Val !== undefined && totalProvPbg !== null && totalProvPbg > 0
      ? Number(((pbg2Val / totalProvPbg) * 100).toFixed(2))
      : null;

  const canComparePbg = pbg1Pct !== null && pbg2Pct !== null && totalProvPbg !== null;
  const maxPbgPct = canComparePbg ? Math.max(pbg1Pct, pbg2Pct, 0.1) : 0.1;

  // 2. OEDE
  const oede1Puestos = ov1?.oede.puestosTrabajo;
  const oede2Puestos = ov2?.oede.puestosTrabajo;
  const oede1Avail = ov1?.oede.disponible && oede1Puestos !== null;
  const oede2Avail = ov2?.oede.disponible && oede2Puestos !== null;
  const oede1Period = oede1Avail ? ov1?.oede.ultimoPeriodo || '' : '';
  const oede2Period = oede2Avail ? ov2?.oede.ultimoPeriodo || '' : '';
  const areOedePeriodsIdentical =
    oede1Avail && oede2Avail && oede1Period === oede2Period && oede1Period !== '';
  const maxOede = Math.max(oede1Puestos || 0, oede2Puestos || 0, 1);

  // 3. EIL
  const eil1Avail = ov1?.eil.disponible;
  const eil2Avail = ov2?.eil.disponible;
  const eilBothGrouped =
    (area1Id === 'A06' && area2Id === 'A07') || (area1Id === 'A07' && area2Id === 'A06');

  // 4. MIP
  const mip1Mult = ov1?.mip.multiplicadorTotalPromedio;
  const mip2Mult = ov2?.mip.multiplicadorTotalPromedio;
  const mip1Direct = ov1?.mip.empleoDirectoPromedio;
  const mip2Direct = ov2?.mip.empleoDirectoPromedio;

  return (
    <div className="space-y-6 py-2" data-testid="area-comparator">
      {/* Selector superior */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Comparador de Áreas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Poné dos actividades frente a frente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Compará producción (PBG), empleo privado (OEDE), tareas (EIL) y conexiones (MIP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ejemplos:
            </span>
            <button onClick={() => setPreset('A01', 'A03')} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
              🌾 Agro vs 🏭 Industria
            </button>
            <button onClick={() => setPreset('A06', 'A07')} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
              🛒 Comercio vs 🏨 Turismo
            </button>
            <button onClick={() => setPreset('A02', 'A04')} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
              ⛏️ Minería vs ⚡ Energía
            </button>
            <button onClick={() => setPreset('A10', 'A11')} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
              🏛️ Estado vs 🎓 Educación
            </button>
          </div>
        </div>

        {/* Selectores */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border-2 border-brand-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold text-brand-700 tracking-wider flex items-center gap-1.5">
                <AreaIcon name={area1.icono} size={15} /> Área 1
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                {area1.area_id}
              </span>
            </div>
            <select
              aria-label="Seleccionar Área 1"
              value={area1Id}
              onChange={(e) => setArea1Id(e.target.value as AreaId)}
              className="w-full text-sm sm:text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {areas.map((a) => (
                <option key={a.area_id} value={a.area_id} disabled={a.area_id === area2Id}>
                  {a.area_id} — {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              type="button"
              className="p-3 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 shadow-xs transition-all hover:rotate-180"
              title="Intercambiar áreas"
              aria-label="Intercambiar Área 1 y Área 2"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border-2 border-indigo-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold text-indigo-700 tracking-wider flex items-center gap-1.5">
                <AreaIcon name={area2.icono} size={15} /> Área 2
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {area2.area_id}
              </span>
            </div>
            <select
              aria-label="Seleccionar Área 2"
              value={area2Id}
              onChange={(e) => setArea2Id(e.target.value as AreaId)}
              className="w-full text-sm sm:text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {areas.map((a) => (
                <option key={a.area_id} value={a.area_id} disabled={a.area_id === area1Id}>
                  {a.area_id} — {a.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. PBG */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                1. PBG · Lo que aporta a la economía de Jujuy
              </h3>
              <span className="text-xs text-slate-500">Fuente: DiPEC · Año 2024*</span>
            </div>
          </div>

          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setPbgPriceMode('constante')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pbgPriceMode === 'constante' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Sin inflación (base 2004)
            </button>
            <button
              onClick={() => setPbgPriceMode('corriente')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pbgPriceMode === 'corriente' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Valores de 2024
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
              <AreaIcon name={area1.icono} size={15} /> {area1.nombre}
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {pbg1Pct !== null ? `${pbg1Pct}%` : 'Sin dato'}
              </div>
              <div className="text-xs font-semibold text-slate-600 font-mono">
                {pbg1Val != null ? `$ ${formatNumber(pbg1Val / 1000, 1)} millones` : ''}
              </div>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${canComparePbg ? Math.min(100, ((pbg1Pct || 0) / maxPbgPct) * 100) : 0}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <AreaIcon name={area2.icono} size={15} /> {area2.nombre}
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {pbg2Pct !== null ? `${pbg2Pct}%` : 'Sin dato'}
              </div>
              <div className="text-xs font-semibold text-slate-600 font-mono">
                {pbg2Val != null ? `$ ${formatNumber(pbg2Val / 1000, 1)} millones` : ''}
              </div>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${canComparePbg ? Math.min(100, ((pbg2Pct || 0) / maxPbgPct) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {canComparePbg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {pbg1Pct! > pbg2Pct! ? (
                <><strong>{area1.nombre}</strong> aporta {formatNumber(pbg1Pct! - pbg2Pct!, 2)} puntos más al PBG provincial que <strong>{area2.nombre}</strong>.</>
              ) : pbg2Pct! > pbg1Pct! ? (
                <><strong>{area2.nombre}</strong> aporta {formatNumber(pbg2Pct! - pbg1Pct!, 2)} puntos más al PBG provincial que <strong>{area1.nombre}</strong>.</>
              ) : (
                'Ambas actividades aportan la misma proporción al PBG de Jujuy.'
              )}
            </span>
          </div>
        )}
      </section>

      {/* 2. OEDE */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              2. OEDE · Puestos de trabajo en empresas privadas
            </h3>
            <span className="text-xs text-slate-500">
              Trabajadores en blanco del sector privado · {oede1Period || oede2Period || provincial.oedeUltimoPeriodo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
              <AreaIcon name={area1.icono} size={15} /> {area1.nombre}
            </div>
            {oede1Avail ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatNumber(oede1Puestos || 0, 0)} <span className="text-xs font-sans font-normal text-slate-500">puestos</span>
                  </div>
                  {ov1?.oede.tieneSecretoEstadistico && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Dato parcial</span>
                  )}
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: `${Math.min(100, ((oede1Puestos || 0) / maxOede) * 100)}%` }} />
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {area1Id === 'A10'
                  ? 'No incluido: OEDE solo cuenta empresas privadas, no empleo estatal.'
                  : 'Sin datos publicados en este período.'}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <AreaIcon name={area2.icono} size={15} /> {area2.nombre}
            </div>
            {oede2Avail ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatNumber(oede2Puestos || 0, 0)} <span className="text-xs font-sans font-normal text-slate-500">puestos</span>
                  </div>
                  {ov2?.oede.tieneSecretoEstadistico && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Dato parcial</span>
                  )}
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, ((oede2Puestos || 0) / maxOede) * 100)}%` }} />
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                {area2Id === 'A10'
                  ? 'No incluido: OEDE solo cuenta empresas privadas, no empleo estatal.'
                  : 'Sin datos publicados en este período.'}
              </p>
            )}
          </div>
        </div>

        {oede1Avail && oede2Avail && areOedePeriodsIdentical && ov1?.oede.esCompleto && ov2?.oede.esCompleto && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {oede1Puestos! > oede2Puestos! ? (
                <><strong>{area1.nombre}</strong> registra {formatNumber(oede1Puestos! - oede2Puestos!, 0)} puestos privados más que <strong>{area2.nombre}</strong>.</>
              ) : oede2Puestos! > oede1Puestos! ? (
                <><strong>{area2.nombre}</strong> registra {formatNumber(oede2Puestos! - oede1Puestos!, 0)} puestos privados más que <strong>{area1.nombre}</strong>.</>
              ) : (
                'Ambas actividades registran la misma cantidad de puestos.'
              )}
            </span>
          </div>
        )}
      </section>

      {/* 3. EIL */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              3. EIL · Encuesta en empresas urbanas (Gran Jujuy)
            </h3>
            <span className="text-xs text-slate-500">Empresas privadas de 5 o más personas</span>
          </div>
        </div>

        {eilBothGrouped ? (
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>En EIL, <strong>Comercio</strong> y <strong>Turismo (Hoteles y Restaurantes)</strong> se publican unidos en un solo grupo, por eso no se comparan por separado.</span>
          </div>
        ) : !eil1Avail || !eil2Avail ? (
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Esta encuesta urbana no incluye campo, minería ni sector público (
              {[!eil1Avail && area1.nombre, !eil2Avail && area2.nombre].filter(Boolean).join(' y ')}).
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ambas actividades tienen datos de seguimiento laboral en el Gran Jujuy.</span>
          </div>
        )}
      </section>

      {/* 4. MIP */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              4. MIP · Conexión con proveedores (base 2015)
            </h3>
            <span className="text-xs text-slate-500">Puestos vinculados por cada $1 millón producido en 2015</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
              <AreaIcon name={area1.icono} size={15} /> {area1.nombre}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Directo (propio)</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip1Direct != null ? formatNumber(mip1Direct, 2) : 's/d'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total (con proveedores)</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip1Mult != null ? formatNumber(mip1Mult, 2) : 's/d'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <AreaIcon name={area2.icono} size={15} /> {area2.nombre}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Directo (propio)</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip2Direct != null ? formatNumber(mip2Direct, 2) : 's/d'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total (con proveedores)</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {mip2Mult != null ? formatNumber(mip2Mult, 2) : 's/d'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ir a las fichas */}
      {onSelectArea && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white">
          <div>
            <h4 className="font-bold text-sm sm:text-base">¿Querés ver una de estas áreas en detalle?</h4>
            <p className="text-xs text-slate-300">Abrí sus gráficos y tablas completas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectArea(area1Id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs"
            >
              <span>Ver {area1.nombre}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectArea(area2Id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
            >
              <span>Ver {area2.nombre}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
