import React, { useState } from 'react';
import { Area, AreaId, PBGDataset, OEDEDataset, EILDataset, MIPDataset, Correspondencia } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { MethodWarning } from '../components/MethodWarning';
import { MissingDataBadge } from '../components/MissingDataBadge';
import { formatNumber, formatCurrencyMiles, formatPercent } from '../utils/formatters';
import { ArrowLeft, FileText, Calendar, Building, Info, HelpCircle, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { HumanDataCards } from '../components/HumanDataCards';

import defaultAreas from '../../data/areas.json';
import defaultPbg from '../../data/pbg.json';
import defaultOede from '../../data/empleo_oede.json';
import defaultEil from '../../data/eil.json';
import defaultMip from '../../data/mip_empleo.json';
import defaultCorrespondencias from '../../data/correspondencias.json';

interface AreaDetailPageProps {
  areaId: AreaId;
  areas?: Area[];
  pbgData?: PBGDataset;
  oedeData?: OEDEDataset;
  eilData?: EILDataset;
  mipData?: MIPDataset;
  correspondencias?: Correspondencia[];
  onBack: () => void;
  onNavigateArea: (areaId: AreaId) => void;
}

export const AreaDetailPage: React.FC<AreaDetailPageProps> = ({
  areaId,
  areas = defaultAreas as Area[],
  pbgData = defaultPbg as PBGDataset,
  oedeData = defaultOede as OEDEDataset,
  eilData = defaultEil as EILDataset,
  mipData = defaultMip as MIPDataset,
  correspondencias = defaultCorrespondencias as Correspondencia[],
  onBack,
  onNavigateArea,
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'pbg' | 'oede' | 'eil' | 'mip'>('todos');
  const [pbgViewMode, setPbgViewMode] = useState<'constante' | 'corriente'>('constante');
  const [pbgPeriodRange, setPbgPeriodRange] = useState<'reciente' | 'historico' | 'completo'>('reciente');

  const currentIndex = areas.findIndex((a) => a.area_id === areaId);
  const prevArea = currentIndex > 0 ? areas[currentIndex - 1] : areas[areas.length - 1];
  const nextArea = currentIndex < areas.length - 1 ? areas[currentIndex + 1] : areas[0];

  const currentArea = areas.find((a) => a.area_id === areaId);
  if (!currentArea) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 mb-4">Área no encontrada.</p>
        <button onClick={onBack} className="btn-primary">Volver al explorador</button>
      </div>
    );
  }

  // 1. PBG
  const pbgRecords = pbgData.series
    .filter((r) => r.area_id === areaId)
    .sort((a, b) => b.periodo_anio - a.periodo_anio);
  const pbgBranches = Array.from(new Set(pbgRecords.map((r) => r.codigo_rama)));
  const latestPbgYear = pbgRecords.length > 0 ? pbgRecords[0].periodo_anio : 2024;
  const latestPbgRecords = pbgRecords.filter((r) => r.periodo_anio === latestPbgYear);

  // 2. OEDE
  const isOEDEAvailable = areaId !== 'A10';
  const oedeRecords = oedeData.series.filter((r) => r.area_id === areaId);
  const oedeLetterBranches = oedeRecords.filter((r) => r.tipo_nivel === 'LETRA');
  const oedeDigitBranches = oedeRecords.filter((r) => r.tipo_nivel === 'DIGITO_2');
  const oedePeriods = Array.from(new Set(oedeRecords.map((r) => r.periodo)));
  const latestOedePeriod = oedePeriods.length > 0 ? oedePeriods[oedePeriods.length - 1] : '';
  const latestOedeLetters = oedeLetterBranches.filter((r) => r.periodo === latestOedePeriod);

  // 3. EIL
  const isEILAvailable = !['A01', 'A02', 'A10'].includes(areaId);
  const isEILAgrupada = ['A06', 'A07'].includes(areaId);
  const eilKey = isEILAgrupada ? 'A06_A07_AGRUPADA' : areaId;
  const eilBranchRecords = eilData.tabla_3_9_2_evolucion_y_ramas.filter((r) => r.area_id === eilKey);
  const eilPeriods = Array.from(new Set(eilBranchRecords.map((r) => r.periodo)));
  const latestEilPeriod = eilPeriods.length > 0 ? eilPeriods[eilPeriods.length - 1] : '';
  const latestEilIndex = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'INDICE_POR_RAMA'
  );
  const latestEilVarTrim = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'VARIACION_TRIMESTRAL_POR_RAMA'
  );
  const latestEilVarAnual = eilBranchRecords.find(
    (r) => r.periodo === latestEilPeriod && r.bloque === 'VARIACION_ANUAL_POR_RAMA'
  );

  // 4. MIP
  const mipSectors = mipData.sectores.filter((s) => s.area_id === areaId);

  // 5. Correspondencias
  const areaCorrespondencias = correspondencias.filter((c) => c.area_id === areaId);

  return (
    <div className="space-y-8 py-6">
      {/* Ruta de navegación */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={onBack} className="hover:text-brand-700 transition-colors flex items-center gap-1 font-medium">
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>
        <span>/</span>
        <button onClick={onBack} className="hover:text-brand-700 transition-colors font-medium">
          12 Áreas
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">{currentArea.nombre}</span>
      </nav>

      {/* Selector rápido de áreas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a las 12 áreas</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full text-xs">
          <button
            onClick={() => onNavigateArea(prevArea.area_id)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-1"
            title={prevArea.nombre}
            aria-label={`Área anterior ${prevArea.nombre}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {areas.map((a) => (
            <button
              key={a.area_id}
              onClick={() => onNavigateArea(a.area_id)}
              className={`px-2 py-1 rounded font-mono font-bold transition-all ${
                a.area_id === areaId
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={a.nombre}
            >
              {a.area_id}
            </button>
          ))}

          <button
            onClick={() => onNavigateArea(nextArea.area_id)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-1"
            title={nextArea.nombre}
            aria-label={`Siguiente área ${nextArea.nombre}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Encabezado del Área */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex items-start gap-4">
        <div className="w-15 h-15 p-3.5 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center flex-shrink-0">
          <AreaIcon name={currentArea.icono} size={30} />
        </div>
        <div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
            {currentArea.area_id}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {currentArea.nombre}
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            {currentArea.descripcion}
          </p>
          <a
            href="#datos-detallados"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>Ir a las tablas completas</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESUMEN VISUAL                                                            */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-slate-900 px-1">Resumen en gráficos</h2>
        <HumanDataCards
          area={currentArea}
          pbgData={pbgData}
          oedeData={oedeData}
          eilData={eilData}
          mipData={mipData}
          onViewTechnicalDetails={(tab) => {
            if (tab) setActiveTab(tab);
            document.getElementById('datos-detallados')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* TABLAS COMPLETAS                                                          */}
      {/* ========================================================================= */}
      <div id="datos-detallados" className="pt-6 border-t border-slate-200 space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Datos completos en tablas
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Podés mirar todas las fuentes juntas o filtrar una por una.
        </p>
      </div>

      {/* Pestañas por fuente */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'todos' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todo
        </button>
        <button
          onClick={() => setActiveTab('pbg')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'pbg'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60'
          }`}
        >
          PBG · Producción
        </button>
        <button
          onClick={() => setActiveTab('oede')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'oede'
              ? 'bg-blue-700 text-white font-semibold'
              : 'text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60'
          }`}
        >
          OEDE · Empleo privado
        </button>
        <button
          onClick={() => setActiveTab('eil')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'eil'
              ? 'bg-purple-700 text-white font-semibold'
              : 'text-purple-800 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/60'
          }`}
        >
          EIL · Tareas
        </button>
        <button
          onClick={() => setActiveTab('mip')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'mip'
              ? 'bg-indigo-700 text-white font-semibold'
              : 'text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/60'
          }`}
        >
          MIP · Conexiones
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PBG · PRODUCCIÓN                                                       */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'pbg') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                PBG · Lo que produce la actividad
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                Producción anual en Jujuy (DiPEC)
              </h3>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setPbgViewMode('constante')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  pbgViewMode === 'constante' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sin inflación (base 2004)
              </button>
              <button
                onClick={() => setPbgViewMode('corriente')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  pbgViewMode === 'corriente' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Valores de cada año
              </button>
            </div>
          </div>

          <MethodWarning type="pbg-provisorio" />

          {/* Último año */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPbgRecords.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-200">
                      Rubro {rec.codigo_rama}
                    </span>
                    <MissingDataBadge status="PROVISORIO" label={`Año ${rec.periodo_anio}*`} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{rec.nombre_rama}</h4>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {pbgViewMode === 'constante'
                      ? formatCurrencyMiles(rec.valor_constante)
                      : formatCurrencyMiles(rec.valor_corriente)}
                  </div>
                  <span className="text-xs text-slate-500">
                    {pbgViewMode === 'constante' ? 'En pesos de 2004 (sin inflación)' : 'En pesos de ese año'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla año por año */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Evolución año por año (en miles de pesos)</span>
              </h4>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
                <button
                  onClick={() => setPbgPeriodRange('reciente')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pbgPeriodRange === 'reciente' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  2015–2024*
                </button>
                <button
                  onClick={() => setPbgPeriodRange('historico')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pbgPeriodRange === 'historico' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  2004–2014
                </button>
                <button
                  onClick={() => setPbgPeriodRange('completo')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    pbgPeriodRange === 'completo' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Todos (2004–2024*)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Rubro</th>
                    {Array.from(new Set(pbgRecords.map((r) => r.periodo_anio)))
                      .filter((y) => {
                        if (pbgPeriodRange === 'reciente') return y >= 2015;
                        if (pbgPeriodRange === 'historico') return y < 2015;
                        return true;
                      })
                      .sort((a, b) => a - b)
                      .map((year) => (
                        <th key={year} className="py-2.5 px-3 text-right">
                          {year}{[2022, 2023, 2024].includes(year) ? '*' : ''}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pbgBranches.map((branchCode) => {
                    const branchRecs = pbgRecords.filter((r) => r.codigo_rama === branchCode);
                    const name = branchRecs.length > 0 ? branchRecs[0].nombre_rama : branchCode;
                    return (
                      <tr key={branchCode} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{branchCode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={name}>{name}</td>
                        {Array.from(new Set(pbgRecords.map((r) => r.periodo_anio)))
                          .filter((y) => {
                            if (pbgPeriodRange === 'reciente') return y >= 2015;
                            if (pbgPeriodRange === 'historico') return y < 2015;
                            return true;
                          })
                          .sort((a, b) => a - b)
                          .map((year) => {
                            const yRec = branchRecs.find((r) => r.periodo_anio === year);
                            const val = pbgViewMode === 'constante' ? yRec?.valor_constante : yRec?.valor_corriente;
                            return (
                              <td key={year} className="py-2.5 px-3 text-right font-mono text-slate-700">
                                {formatNumber(val, 0)}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              * Datos provisorios · Valores en miles de pesos ({pbgViewMode === 'constante' ? 'base 2004 sin inflación' : 'de cada año'}) · Fuente: DiPEC.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. OEDE · EMPLEO PRIVADO                                                  */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'oede') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase tracking-wider font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              OEDE / SIPA · Empleo privado en blanco
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1.5">
              Puestos de trabajo en empresas privadas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cuenta puestos en blanco del sector privado (no incluye empleados públicos ni trabajo informal).
            </p>
          </div>

          {!isOEDEAvailable ? (
            <MethodWarning type="oede-a10" />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestOedeLetters.map((rec) => (
                  <div key={rec.id} className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-blue-900 border border-blue-200">
                          Rubro {rec.codigo_rama}
                        </span>
                        <MissingDataBadge
                          status={rec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO' ? 'SIN_DATO_SECRETO_ESTADISTICO' : 'PUBLICADO'}
                        />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{rec.nombre_rama}</h4>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {rec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
                          ? 'Reservado'
                          : formatNumber(rec.puestos_trabajo, 0)}
                      </div>
                      <span className="text-xs text-slate-500">
                        {rec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
                          ? 'Pocas empresas (dato protegido)'
                          : `Puestos registrados (${rec.periodo})`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {oedeDigitBranches.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Detalle por subrubro ({latestOedePeriod})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Subrubro</th>
                          <th className="py-2.5 px-3 text-right">Puestos</th>
                          <th className="py-2.5 px-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {oedeDigitBranches
                          .filter((r) => r.periodo === latestOedePeriod)
                          .map((dRec) => (
                            <tr key={dRec.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{dRec.codigo_rama}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{dRec.nombre_rama}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                                {dRec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO'
                                  ? 'Reservado'
                                  : formatNumber(dRec.puestos_trabajo, 0)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {dRec.estado_dato === 'SIN_DATO_SECRETO_ESTADISTICO' ? (
                                  <MissingDataBadge status="SIN_DATO_SECRETO_ESTADISTICO" label="Reservado" />
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-medium">Disponible</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    “Reservado” significa que hay pocas empresas en ese subrubro y no se publica el número exacto por privacidad.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. EIL · TAREAS Y MOVIMIENTO EN GRAN JUJUY                                */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'eil') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase tracking-wider font-extrabold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              EIL · Empleo urbano en Gran Jujuy
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1.5">
              Cómo se mueve el empleo en empresas de 5 o más personas
            </h3>
          </div>

          {!isEILAvailable ? (
            ['A01', 'A02'].includes(areaId) ? (
              <MethodWarning type="eil-primaria" />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                <strong>No medido en EIL:</strong> esta encuesta solo consulta empresas privadas y no incluye al sector público.
              </div>
            )
          ) : (
            <div className="space-y-4">
              {isEILAgrupada && <MethodWarning type="eil-agrupada" />}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900 block">Nivel de empleo</span>
                  <div className="text-2xl font-extrabold text-slate-900 my-1.5">
                    {latestEilIndex ? formatNumber(latestEilIndex.valor, 2) : 'Sin dato'}
                  </div>
                  <span className="text-xs text-slate-500 block">Índice (febrero 2015 = 100) · {latestEilPeriod}</span>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900 block">Cambio en el último trimestre</span>
                  <div className="text-2xl font-extrabold text-slate-900 my-1.5">
                    {latestEilVarTrim ? formatPercent(latestEilVarTrim.valor, 2) : 'Sin dato'}
                  </div>
                  <span className="text-xs text-slate-500 block">Frente al trimestre anterior · {latestEilPeriod}</span>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900 block">Cambio en el último año</span>
                  <div className="text-2xl font-extrabold text-slate-900 my-1.5">
                    {latestEilVarAnual ? formatPercent(latestEilVarAnual.valor, 2) : 'Sin dato'}
                  </div>
                  <span className="text-xs text-slate-500 block">Frente al mismo período del año pasado</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Rubro en la encuesta: <strong>{latestEilIndex?.concepto || 'No disponible'}</strong>. Para ver búsquedas y tipos de tareas de toda la ciudad, entrá a “EIL · Tareas y búsquedas” en el menú superior.
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. MIP · CONEXIÓN CON OTROS RUBROS                                        */}
      {/* ========================================================================= */}
      {(activeTab === 'todos' || activeTab === 'mip') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              MIP · Relación con otros rubros
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1.5">
              Trabajo propio y en proveedores (foto de 2015)
            </h3>
          </div>

          <MethodWarning type="mip-base2015" />

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              Rubros incluidos ({mipSectors.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mipSectors.map((sec) => (
                <div key={sec.sector_mip_id} className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-slate-900 text-sm">{sec.nombre_sector}</h5>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200 shrink-0">
                      #{sec.sector_mip_id}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-indigo-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Directo</span>
                      <span className="text-base font-extrabold text-indigo-950 font-mono">
                        {sec.empleo_directo_por_millon !== null ? formatNumber(sec.empleo_directo_por_millon, 2) : '-'}
                      </span>
                      <span className="text-[9px] text-slate-500 block">en el rubro</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-indigo-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Indirecto</span>
                      <span className="text-base font-extrabold text-indigo-700 font-mono">
                        {sec.empleo_indirecto_por_millon !== null ? formatNumber(sec.empleo_indirecto_por_millon, 2) : '-'}
                      </span>
                      <span className="text-[9px] text-slate-500 block">proveedores</span>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-indigo-200 block">Total</span>
                      <span className="text-base font-extrabold font-mono">
                        {sec.multiplicador_total_por_millon !== null ? formatNumber(sec.multiplicador_total_por_millon, 2) : '-'}
                      </span>
                      <span className="text-[9px] text-indigo-200 block">sumados</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Puestos vinculados por cada $1 millón producido en 2015 · Fuente: DiPEC / CEP XXI.
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. TABLA DE RUBROS QUE COMPONEN ESTA ÁREA                                 */}
      {/* ========================================================================= */}
      <section className="bg-slate-100/90 rounded-3xl p-6 border border-slate-200 space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-600" />
          ¿Qué rubros oficiales incluye {currentArea.nombre}?
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fuente</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Nombre en la fuente</th>
                <th className="py-2.5 px-3">Aclaración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areaCorrespondencias.map((c) => (
                <tr key={c.correspondencia_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">{c.fuente}</td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-700">{c.codigo_fuente}</td>
                  <td className="py-2 px-3 text-slate-800">{c.nombre_fuente}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{c.observacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Navegación inferior */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <button
          onClick={() => {
            onNavigateArea(prevArea.area_id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full sm:w-auto flex items-center gap-3 text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-brand-700 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Anterior</span>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700">{prevArea.nombre}</span>
          </div>
        </button>

        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-brand-700 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Ver las 12 áreas
        </button>

        <button
          onClick={() => {
            onNavigateArea(nextArea.area_id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 text-right p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
        >
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Siguiente</span>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700">{nextArea.nombre}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-700 shrink-0" />
        </button>
      </div>
    </div>
  );
};
