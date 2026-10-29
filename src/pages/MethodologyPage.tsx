import React from 'react';
import { MetadataDataset, Correspondencia, Area } from '../types';
import { ShieldCheck, BookOpen } from 'lucide-react';
import defaultMetadata from '../../data/metadata.json';
import defaultCorrespondencias from '../../data/correspondencias.json';
import defaultAreas from '../../data/areas.json';

interface MethodologyPageProps {
  metadata?: MetadataDataset;
  correspondencias?: Correspondencia[];
  areas?: Area[];
}

const EXPLICACION_CORTA: Record<string, string> = {
  PBG: 'Lo que produce cada actividad en Jujuy',
  OEDE: 'Puestos de trabajo en blanco en empresas privadas',
  EIL: 'Tipos de tareas y búsquedas en empresas del Gran Jujuy',
  MIP: 'Cómo se conectan las actividades y sus proveedores',
};

const NOTA_SIMPLE: Record<string, string> = {
  PBG: 'Los años 2022*, 2023* y 2024* son provisorios en la publicación oficial.',
  OEDE: 'Solo incluye empresas privadas (no mide empleo público). Cuando hay pocas empresas en un rubro se muestra como “Dato reservado”.',
  EIL: 'Mide empresas privadas de 5 o más personas en el Gran Jujuy (no incluye campo, minería ni empleo público).',
  MIP: 'Muestra las conexiones entre rubros según el estudio oficial base 2015 (no son puestos actuales).',
};

const UNIDAD_SIMPLE: Record<string, string> = {
  PBG: 'Pesos sin inflación (base 2004), valores de cada año y variación anual (%)',
  OEDE: 'Cantidad de puestos de trabajo registrados',
  EIL: 'Porcentajes por tipo de tarea y evolución del empleo',
  MIP: 'Puestos directos e indirectos estimados por cada millón producido (base 2015)',
};

export const MethodologyPage: React.FC<MethodologyPageProps> = ({
  metadata = defaultMetadata as MetadataDataset,
  correspondencias = defaultCorrespondencias as Correspondencia[],
  areas = defaultAreas as Area[],
}) => {
  return (
    <div className="space-y-10 py-8">
      {/* Encabezado */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Datos públicos oficiales</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ¿De dónde salen los datos?
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
          Todos los números de esta página provienen de organismos oficiales de Jujuy y de Nación. No usamos estimaciones inventadas.
        </p>
      </div>

      {/* Fichas de las 4 fuentes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Las 4 fuentes utilizadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {metadata.fuentes_oficiales.map((f) => (
            <div
              key={f.fuente_id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 border border-brand-200">
                    {f.fuente_id} · {EXPLICACION_CORTA[f.fuente_id] || f.indicador}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{f.organismo}</h3>

                <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                  <div>
                    <span className="font-semibold text-slate-700">Frecuencia: </span>
                    <span>{f.periodicidad}</span>
                  </div>
                  {f.universo && (
                    <div>
                      <span className="font-semibold text-slate-700">Qué abarca: </span>
                      <span>{f.universo} ({f.cobertura || 'Jujuy'})</span>
                    </div>
                  )}
                  {(UNIDAD_SIMPLE[f.fuente_id] || (f.unidades && f.unidades.length > 0)) && (
                    <div>
                      <span className="font-semibold text-slate-700">Cómo se mide: </span>
                      <span>{UNIDAD_SIMPLE[f.fuente_id] || f.unidades?.join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 leading-relaxed">
                  <strong>A tener en cuenta:</strong> {NOTA_SIMPLE[f.fuente_id] || f.condicion_especial}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 aclaraciones simples */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          ¿Por qué a veces dice “No incluido”?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">Estado en OEDE (A10)</div>
            <p className="leading-relaxed">
              OEDE solo cuenta trabajadores de empresas privadas. Por eso no muestra datos de Administración Pública (no significa que sea cero).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">Agro y Minería en EIL</div>
            <p className="leading-relaxed">
              La encuesta EIL se hace solo en empresas urbanas del Gran Jujuy y no releva campo ni minería.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">Comercio y Turismo en EIL</div>
            <p className="leading-relaxed">
              En esa encuesta, Comercio, Hoteles y Restaurantes vienen agrupados en una sola fila.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de rubros por área */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Tabla de rubros agrupados en las {areas.length} áreas
          </h2>
          <p className="text-xs text-slate-500">
            Cómo se vincula cada rubro oficial con las 12 áreas de la aplicación:
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Área</th>
                <th className="py-2.5 px-3">Fuente</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Rubro en la fuente</th>
                <th className="py-2.5 px-3">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {correspondencias.map((c) => (
                <tr key={c.correspondencia_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-brand-700">{c.area_id || '—'}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{c.fuente}</td>
                  <td className="py-2 px-3 font-mono text-slate-600">{c.codigo_fuente}</td>
                  <td className="py-2 px-3 text-slate-900">{c.nombre_fuente}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{c.observacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
