import React, { useState } from 'react';
import { EILDataset } from '../types';
import { formatNumber } from '../utils/formatters';
import { Users, Search, Info, Calendar } from 'lucide-react';
import defaultEil from '../../data/eil.json';

interface EilTransversalPageProps {
  eilData?: EILDataset;
}

const NOMBRES_SIMPLES_396: Record<string, string> = {
  'Tasa de entrada': 'Ingresos de personal (altas)',
  'Tasa de salida': 'Salidas de personal (bajas)',
  'Tasa de rotación': 'Movimiento general (rotación)',
  'Tasa de reemplazo': 'Bajas que se reemplazaron',
  'Composición de altas': 'Qué parte de los ingresos fue en cada tarea',
  'Composición de bajas': 'Qué parte de las salidas fue en cada tarea',
};

export const EilTransversalPage: React.FC<EilTransversalPageProps> = ({
  eilData = defaultEil as EILDataset,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'calificacion' | 'demanda'>('calificacion');

  const periods396 = Array.from(new Set(eilData.tabla_3_9_6_calificacion_tarea.map((r) => r.periodo))).sort();
  const periods398 = Array.from(new Set(eilData.tabla_3_9_8_demanda_laboral.map((r) => r.periodo))).sort();

  const latestMonth396 = periods396.length > 0 ? periods396[periods396.length - 1] : '';
  const latestMonth398 = periods398.length > 0 ? periods398[periods398.length - 1] : '';

  const [selectedMonth396, setSelectedMonth396] = useState(latestMonth396);
  const [selectedMonth398, setSelectedMonth398] = useState(latestMonth398);

  const recs396 = eilData.tabla_3_9_6_calificacion_tarea.filter((r) => r.periodo === selectedMonth396);
  const recs398 = eilData.tabla_3_9_8_demanda_laboral.filter((r) => r.periodo === selectedMonth398);

  const califCategories = ['Total', 'Profesional', 'Técnica', 'Operativa', 'No Calificada'];

  return (
    <div className="space-y-6 py-6">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-5 space-y-1.5">
        <span className="inline-block text-xs uppercase tracking-wider font-extrabold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          EIL · Gran Jujuy
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Tipos de tareas y búsquedas de personal
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Datos de empresas privadas de 5 o más trabajadores en el Gran Jujuy (MTEySS).
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('calificacion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'calificacion' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tipos de tareas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('demanda')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'demanda' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Búsqueda de personal</span>
        </button>
      </div>

      {/* SUBSECCIÓN 1: TAREAS */}
      {activeSubTab === 'calificacion' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Importante:</strong> “Profesional, Técnica, Operativa o No Calificada” describe qué tarea pide el puesto, no qué estudios tiene la persona.
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Mes:</span>
            </div>
            <select
              value={selectedMonth396}
              onChange={(e) => setSelectedMonth396(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-medium bg-white text-slate-800"
            >
              {periods396.slice(-24).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Ingresos y salidas según tipo de tarea ({selectedMonth396})
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Qué mide</th>
                    {califCategories.map((cat) => (
                      <th key={cat} className="py-2.5 px-3 text-right">{cat}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(NOMBRES_SIMPLES_396).map((indName) => (
                    <tr key={indName} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {NOMBRES_SIMPLES_396[indName]}
                      </td>
                      {califCategories.map((cat) => {
                        const r = recs396.find(
                          (x) =>
                            x.indicador === indName &&
                            x.calificacion_tarea.toLowerCase() === cat.toLowerCase()
                        );
                        return (
                          <td key={cat} className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {r?.valor != null ? `${formatNumber(r.valor, 2)}%` : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">Fuente: EIL · MTEySS.</p>
          </div>
        </div>
      )}

      {/* SUBSECCIÓN 2: BÚSQUEDAS */}
      {activeSubTab === 'demanda' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Muestra qué porcentaje de empresas buscó personal ese mes y cuántos de esos puestos lograron cubrir.
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Mes:</span>
            </div>
            <select
              value={selectedMonth398}
              onChange={(e) => setSelectedMonth398(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-medium bg-white text-slate-800"
            >
              {periods398.slice(-24).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">¿Buscaron personal las empresas?</h3>
              <div className="space-y-2">
                {recs398
                  .filter((r) => r.indicador === 'Demanda Laboral (Empresas)')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{r.categoria_demanda}</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.valor !== null ? `${formatNumber(r.valor, 1)}%` : '-'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">¿Pudieron cubrir los puestos?</h3>
              <div className="space-y-2">
                {recs398
                  .filter((r) => r.indicador === 'Cobertura de puestos buscados')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{r.categoria_demanda}</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.valor !== null ? `${formatNumber(r.valor, 1)}%` : '-'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Búsquedas y puestos sin cubrir según tarea ({selectedMonth398})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tipo de tarea</th>
                    <th className="py-2.5 px-3 text-right">Búsquedas (%)</th>
                    <th className="py-2.5 px-3 text-right">Parte de los no cubiertos (%)</th>
                    <th className="py-2.5 px-3 text-right">Quedaron sin cubrir (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['Total', 'Profesionales', 'Técnicos', 'Operativos', 'No calificados'].map((cat) => {
                    const rBusq = recs398.find(
                      (x) =>
                        x.indicador === 'Tasa de búsqueda según calificación' &&
                        x.categoria_demanda.toLowerCase() === cat.toLowerCase()
                    );
                    const rComp = recs398.find(
                      (x) =>
                        x.indicador === 'Composición puestos no cubiertos según calificación' &&
                        x.categoria_demanda.toLowerCase() === cat.toLowerCase()
                    );
                    const rNoCob = recs398.find(
                      (x) =>
                        x.indicador === 'Tasa de no cobertura según calificación' &&
                        x.categoria_demanda.toLowerCase() === cat.toLowerCase()
                    );

                    return (
                      <tr key={cat} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{cat}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {rBusq?.valor != null ? `${formatNumber(rBusq.valor, 2)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {rComp?.valor != null ? `${formatNumber(rComp.valor, 1)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {rNoCob?.valor != null ? `${formatNumber(rNoCob.valor, 1)}%` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">Fuente: EIL · MTEySS.</p>
          </div>
        </div>
      )}
    </div>
  );
};
