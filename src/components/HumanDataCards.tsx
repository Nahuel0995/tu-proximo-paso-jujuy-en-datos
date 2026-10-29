import React, { useState } from 'react';
import { Area, TipoTareaInteres, PBGDataset, OEDEDataset, EILDataset, MIPDataset } from '../types';
import { formatNumber } from '../utils/formatters';
import {
  TrendingUp,
  Users,
  Network,
  Briefcase,
  BarChart2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

import { PbgGauge } from './charts/PbgGauge';
import { SipaPuestos } from './charts/SipaPuestos';
import { MipStackedBar } from './charts/MipStackedBar';
import { TimeEvolutionChart } from './charts/TimeEvolutionChart';
import { getPbgSeries, getEmpleoSeries } from '../utils/areaMetrics';

import defaultPbg from '../../data/pbg.json';
import defaultOede from '../../data/empleo_oede.json';
import defaultEil from '../../data/eil.json';
import defaultMip from '../../data/mip_empleo.json';

interface HumanDataCardsProps {
  area: Area;
  tipoTareaInteres?: TipoTareaInteres | null;
  onViewTechnicalDetails: (tab?: 'pbg' | 'oede' | 'eil' | 'mip') => void;
  pbgData?: PBGDataset;
  oedeData?: OEDEDataset;
  eilData?: EILDataset;
  mipData?: MIPDataset;
}

export const HumanDataCards: React.FC<HumanDataCardsProps> = ({
  area,
  tipoTareaInteres,
  onViewTechnicalDetails,
  pbgData = defaultPbg as PBGDataset,
  oedeData = defaultOede as OEDEDataset,
  eilData = defaultEil as EILDataset,
  mipData = defaultMip as MIPDataset,
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const toggleExpand = (cardId: string) =>
    setExpandedCard(expandedCard === cardId ? null : cardId);

  // 1. PBG
  const pbgRecords = pbgData.series
    .filter((r) => r.area_id === area.area_id)
    .sort((a, b) => b.periodo_anio - a.periodo_anio);
  const latestPbgYear = pbgRecords.length > 0 ? pbgRecords[0].periodo_anio : 2024;
  const latestPbgRecs = pbgRecords.filter((r) => r.periodo_anio === latestPbgYear);
  const totalValConstante = latestPbgRecs.reduce((acc, r) => acc + (r.valor_constante || 0), 0);

  const totalProvincialPbg =
    pbgData.series.filter((r) => r.codigo_rama === 'TOTAL' && r.periodo_anio === latestPbgYear)[0]
      ?.valor_constante || 1;
  const pbgSharePctNum = (totalValConstante / totalProvincialPbg) * 100;
  const pbgSharePct = pbgSharePctNum.toFixed(1);

  // 2. OEDE
  const isA10 = area.area_id === 'A10';
  const oedeRecords = oedeData.series.filter((r) => r.area_id === area.area_id);
  const oedeLetterBranches = oedeRecords.filter((r) => r.tipo_nivel === 'LETRA');
  const oedePeriods = Array.from(new Set(oedeRecords.map((r) => r.periodo)));
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '';
  const latestOedeLetters = oedeLetterBranches.filter((r) => r.periodo === latestOedePeriod);
  const totalPuestosOede = latestOedeLetters.reduce(
    (acc, r) => acc + (r.puestos_trabajo || 0),
    0
  );
  const hasOedeSecret = latestOedeLetters.some(
    (r) => r.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
  );

  const sipaSerie = oedePeriods
    .map((p) => {
      const recs = oedeLetterBranches.filter((r) => r.periodo === p);
      const valid = recs.filter((r) => typeof r.puestos_trabajo === 'number');
      return {
        periodo: String(p),
        puestos: valid.reduce((acc, r) => acc + (r.puestos_trabajo || 0), 0),
        hasData: valid.length > 0,
      };
    })
    .filter((s) => s.hasData)
    .slice(-12)
    .map(({ periodo, puestos }) => ({ periodo, puestos }));

  // 3. MIP
  const mipSectors = mipData.sectores.filter((s) => s.area_id === area.area_id);
  const primaryMipSector = mipSectors.length > 0 ? mipSectors[0] : null;

  // 4. EIL
  const isPrimaria = ['A01', 'A02'].includes(area.area_id);
  const isAgrupada = ['A06', 'A07'].includes(area.area_id);
  const eilKey = isAgrupada ? 'A06_A07_AGRUPADA' : area.area_id;
  const eilBranchRecords = eilData.tabla_3_9_2_evolucion_y_ramas.filter(
    (r) => r.area_id === eilKey
  );
  const eilPeriods = Array.from(new Set(eilBranchRecords.map((r) => r.periodo)));
  const latestEilPeriod = eilPeriods.length > 0 ? eilPeriods[eilPeriods.length - 1] : '';
  const latestEilIndex = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'INDICE_POR_RAMA'
  );

  return (
    <div className="space-y-5">
      {/* ======================================================================= */}
      {/* TARJETA 1: PBG · LO QUE PRODUCE LA ACTIVIDAD                            */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>

            <div className="space-y-2 flex-1">
              <span className="inline-block text-[11px] uppercase tracking-wider font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                PBG · Lo que produce la actividad
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {pbgSharePctNum > 0
                  ? `Representa el ${pbgSharePct}% de la economía de Jujuy`
                  : 'Actividad registrada en Jujuy'}
              </h3>

              {pbgSharePctNum > 0 && (
                <PbgGauge
                  areaValueMillones={totalValConstante / 1000}
                  totalValueMillones={totalProvincialPbg / 1000}
                  areaLabel={area.nombre}
                />
              )}

              <p className="text-xs text-slate-600">
                Año {latestPbgYear}*: <strong>$ {formatNumber(totalValConstante / 1000, 2)} millones</strong> (medido sin inflación, en pesos de 2004).
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleExpand('pbg')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="¿Qué es el PBG?"
            title="¿Qué es el PBG?"
          >
            {expandedCard === 'pbg' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente: DiPEC ({latestPbgYear}*)</span>
          <button
            onClick={() => onViewTechnicalDetails('pbg')}
            className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1"
          >
            <span>Ver tabla año por año</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {expandedCard === 'pbg' && (
          <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-700">
            <strong>¿Qué es el PBG?</strong> Es el valor de todo lo que se produce en Jujuy en un año. Se mide en pesos de 2004 para comparar sin el efecto de la inflación.
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 2: OEDE / SIPA · EMPLEO PRIVADO REGISTRADO                      */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm hover:border-blue-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>

            <div className="space-y-2 flex-1">
              <span className="inline-block text-[11px] uppercase tracking-wider font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                OEDE / SIPA · Empleo privado en blanco
              </span>

              {isA10 ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>No incluye empleo público:</strong> esta fuente solo cuenta trabajadores de empresas privadas, por eso acá no aparecen los puestos del Estado.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {totalPuestosOede > 0 ? (
                    <SipaPuestos total={totalPuestosOede} serie={sipaSerie} />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-slate-900">—</h3>
                      <span className="text-sm font-bold text-slate-600">puestos registrados</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    Puestos en empresas privadas ({latestOedePeriod}). No incluye trabajo estatal ni informal.
                    {hasOedeSecret && ' Algunos subrubros están reservados por privacidad.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleExpand('oede')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="¿Qué mide OEDE?"
            title="¿Qué mide OEDE?"
          >
            {expandedCard === 'oede' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente: OEDE / SIPA · {isA10 ? 'Solo sector privado' : latestOedePeriod}</span>
          <button
            onClick={() => onViewTechnicalDetails('oede')}
            className="font-bold text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1"
          >
            <span>Ver desglose por rubro</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {expandedCard === 'oede' && (
          <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
            <strong>¿Qué cuenta este número?</strong> Los puestos en blanco declarados por empresas privadas en Jujuy. Una misma persona puede tener más de un puesto, y no incluye monotributistas ni empleados públicos.
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 3: MIP · RELACIÓN CON OTROS RUBROS                              */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm hover:border-indigo-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 border border-indigo-100">
              <Network className="w-5 h-5" />
            </div>

            <div className="space-y-2 flex-1">
              <span className="inline-block text-[11px] uppercase tracking-wider font-black text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                MIP · Cómo impulsa a otros rubros
              </span>

              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Cuando esta actividad crece, también mueve trabajo en sus proveedores.
              </p>

              {primaryMipSector && (
                <div className="pt-1">
                  <MipStackedBar
                    directo={primaryMipSector.empleo_directo_por_millon ?? 0}
                    indirecto={primaryMipSector.empleo_indirecto_por_millon ?? 0}
                    total={
                      primaryMipSector.multiplicador_total_por_millon ??
                      (primaryMipSector.empleo_directo_por_millon ?? 0) +
                        (primaryMipSector.empleo_indirecto_por_millon ?? 0)
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleExpand('mip')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="¿Qué es la MIP?"
            title="¿Qué es la MIP?"
          >
            {expandedCard === 'mip' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente: MIP Jujuy (foto de 2015, no es empleo actual)</span>
          <button
            onClick={() => onViewTechnicalDetails('mip')}
            className="font-bold text-indigo-700 hover:text-indigo-900 transition-colors flex items-center gap-1"
          >
            <span>Ver sectores conectados</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {expandedCard === 'mip' && (
          <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700">
            <strong>¿Cómo se lee?</strong> Muestra cuántos puestos propios (directos) y en proveedores (indirectos) se vinculaban por cada millón producido en 2015. Sirve para ver conexiones entre sectores, no vacantes de hoy.
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 4: EIL · TIPOS DE TAREAS                                        */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm hover:border-purple-300 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-100">
              <Briefcase className="w-5 h-5" />
            </div>

            <div className="space-y-2 flex-1">
              <span className="inline-block text-[11px] uppercase tracking-wider font-black text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                EIL · Tipos de tareas en empresas
              </span>

              {isPrimaria ? (
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                  <strong>No medido en esta encuesta:</strong> la EIL solo consulta empresas urbanas del Gran Jujuy y no incluye campo ni minería.
                </div>
              ) : isA10 ? (
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                  <strong>No medido en esta encuesta:</strong> la EIL solo consulta empresas privadas, no reparticiones públicas.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Tipos de puestos que piden las empresas en Gran Jujuy (según la tarea, no el título):
                    {isAgrupada && (
                      <span className="text-slate-500 font-normal"> · Comercio y Turismo se informan juntos.</span>
                    )}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'profesional', label: 'Profesional', hint: 'Gestión y análisis', bar: 'w-3/5' },
                      { id: 'tecnica', label: 'Técnica', hint: 'Conocimiento práctico', bar: 'w-4/5' },
                      { id: 'operativa', label: 'Operativa', hint: 'Oficios y ejecución', bar: 'w-full' },
                      { id: 'no_calificada', label: 'Inicial', hint: 'Tareas simples', bar: 'w-2/5' },
                    ].map((cat) => {
                      const isUserInterest = tipoTareaInteres === cat.id;
                      return (
                        <div
                          key={cat.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isUserInterest
                              ? 'bg-purple-100 border-purple-300 ring-2 ring-purple-400 shadow-xs'
                              : 'bg-purple-50/50 border-purple-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{cat.label}</span>
                            {isUserInterest && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-purple-800 bg-white px-1.5 py-0.5 rounded-full border border-purple-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                Tu elección
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{cat.hint}</span>
                          <div className="w-full bg-purple-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className={`bg-purple-600 h-full rounded-full ${cat.bar}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleExpand('eil')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="¿Qué es la EIL?"
            title="¿Qué es la EIL?"
          >
            {expandedCard === 'eil' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Fuente: EIL · Gran Jujuy</span>
          <button
            onClick={() => onViewTechnicalDetails('eil')}
            className="font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1"
          >
            <span>Ver datos de EIL</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {expandedCard === 'eil' && (
          <div className="mt-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-slate-700">
            <strong>Importante:</strong> describe qué tarea pide el puesto (por ejemplo, operativa o técnica), no qué título tiene la persona.
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* TARJETA 5: EVOLUCIÓN EN EL TIEMPO                                       */}
      {/* ======================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200">
            <BarChart2 className="w-5 h-5" />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <span className="inline-block text-[11px] uppercase tracking-wider font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              PBG y OEDE · Cómo cambió con los años
            </span>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Evolución histórica de la actividad
            </h3>

            {latestEilIndex && (
              <p className="text-xs text-slate-600">
                Índice EIL reciente ({latestEilPeriod}): <strong>{formatNumber(latestEilIndex.valor, 1)}</strong> (base 2015 = 100).
              </p>
            )}

            <div className="pt-1">
              <TimeEvolutionChart
                areaLabel={area.nombre}
                data={{
                  pbg: getPbgSeries(area.area_id, pbgData),
                  empleo: getEmpleoSeries(area.area_id, oedeData),
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Series oficiales: 2004–2024* (PBG) y 1996–2026 (OEDE)</span>
          <button
            onClick={() => onViewTechnicalDetails('pbg')}
            className="font-bold text-slate-800 hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            <span>Ver tablas completas</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
