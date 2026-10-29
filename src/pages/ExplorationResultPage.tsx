import React, { useState } from 'react';
import { Area, AreaId, PreferenciasExploracion } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { HumanDataCards } from '../components/HumanDataCards';
import { RotateCcw, Layers, ArrowRight, Compass } from 'lucide-react';

interface ExplorationResultPageProps {
  preferences: PreferenciasExploracion;
  areas: Area[];
  onSelectArea: (areaId: AreaId) => void;
  onRestartWizard: () => void;
  onViewAllAreas: () => void;
  onViewTechnicalDetails: (areaId: AreaId, tab?: 'pbg' | 'oede' | 'eil' | 'mip') => void;
  onViewMethodology: () => void;
}

export const ExplorationResultPage: React.FC<ExplorationResultPageProps> = ({
  preferences,
  areas,
  onSelectArea,
  onRestartWizard,
  onViewAllAreas,
  onViewTechnicalDetails,
  onViewMethodology,
}) => {
  const initialAreaId = preferences.areasSeleccionadas[0] || 'A01';
  const [activeAreaId, setActiveAreaId] = useState<AreaId>(initialAreaId);
  const activeArea = areas.find((a) => a.area_id === activeAreaId) || areas[0];

  const userSelectedAreas = areas.filter((a) =>
    preferences.areasSeleccionadas.includes(a.area_id)
  );

  const getContextPhrase = () => {
    const tareaLabel =
      preferences.tipoTarea &&
      preferences.tipoTarea !== 'indefinido' &&
      preferences.tipoTarea !== 'varias'
        ? `, con interés en tareas de tipo ${preferences.tipoTarea}`
        : '';

    if (userSelectedAreas.length === 1) {
      return (
        <span>
          Elegiste mirar <strong>{userSelectedAreas[0].nombre}</strong>
          {tareaLabel}.
        </span>
      );
    }
    if (userSelectedAreas.length === 2) {
      return (
        <span>
          Elegiste <strong>{userSelectedAreas[0].nombre}</strong> y{' '}
          <strong>{userSelectedAreas[1].nombre}</strong>
          {tareaLabel}.
        </span>
      );
    }
    return <span>Estás viendo las 12 actividades económicas de Jujuy.</span>;
  };

  return (
    <div className="space-y-8 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Tu resultado</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestartWizard}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cambiar respuestas</span>
            </button>
            <button
              onClick={onViewAllAreas}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ver las 12 áreas</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tu exploración de Jujuy
          </h1>
          <p className="text-sm text-slate-300 mt-1.5">{getContextPhrase()}</p>
        </div>

        {userSelectedAreas.length > 1 && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Viendo ahora:</span>
            {userSelectedAreas.map((a) => {
              const isCurrent = a.area_id === activeAreaId;
              return (
                <button
                  key={a.area_id}
                  onClick={() => {
                    setActiveAreaId(a.area_id);
                    onSelectArea(a.area_id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-brand-500 text-white shadow-md ring-2 ring-brand-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <AreaIcon name={a.icono} size={15} />
                  <span>{a.nombre}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Área activa */}
      <div className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="w-13 h-13 p-3 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0 border border-brand-100">
          <AreaIcon name={activeArea.icono} size={26} />
        </div>
        <div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-800">
            {activeArea.area_id}
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {activeArea.nombre}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{activeArea.descripcion}</p>
        </div>
      </div>

      {/* Tarjetas visuales */}
      <HumanDataCards
        area={activeArea}
        tipoTareaInteres={preferences.tipoTarea}
        onViewTechnicalDetails={(tab) => onViewTechnicalDetails(activeArea.area_id, tab)}
      />

      {/* Acceso a las tablas completas */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white">¿Querés ver las tablas completas?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Consultá todos los años, rubros y números detallados de esta actividad, o conocé{' '}
            <button onClick={onViewMethodology} className="text-brand-300 hover:underline font-semibold">
              de dónde salen los datos
            </button>
            .
          </p>
        </div>

        <button
          onClick={() => onViewTechnicalDetails(activeArea.area_id)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all whitespace-nowrap"
        >
          <span>Abrir ficha y tablas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
